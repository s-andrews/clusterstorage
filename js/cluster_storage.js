const backend = "/cgi-bin/cluster_storage.py"
var session = ""

$( document ).ready(function() {
    show_login()

    // Action when they log in
    $("#login").click(process_login)
    $("#password").keypress(function(e){
        if(e.keyCode == 13){
            process_login();
        }
    });

    // Action when they log out
    $("#logout").click(logout)
})


function show_login() {

    // Check to see if there's a valid session ID we can use

    session = Cookies.get("cluster_storage_session_id")
    if (session) {
        // Validate the ID
        $.ajax(
            {
                url: backend,
                method: "POST",
                data: {
                    action: "validate_session",
                    session: session,
                },
                success: function(session_string) {
                    if (!session_string.startsWith("Success:")) {
                        session = ""
                        Cookies.remove("imagetrack_session_id")
                        $("#logindiv").modal("show")
                        show_login()
                        return
                    }
                    var realname = session_string.substring(9)
                    $("#logindiv").modal("hide")
                    $("#maincontent").show()
    
                    // Get their list of projects
                    update_folders()

                },
                error: function(message) {
                    console.log("Existing session didn't validate")
                    $("#logindiv").modal("show")
                }
            }
        )
    }
    else {
        $("#logindiv").modal("show")
    }
}

function logout() {
    session_id = ""
    Cookies.remove("imagetrack_session_id")
    $("#maincontent").hide()
    $('#projecttable').DataTable().clear()
    $("#logindiv").modal("show")
}



function process_login() {
    let username = $("#username").val()
    let password = $("#password").val()

    // Clear the password so they can't do it again
    $("#password").val("")

    $.ajax(
        {
            url: backend,
            method: "POST",
            data: {
                action: "login",
                username: username,
                password: password
            },
            success: function(session_string) {
                let sections = session_string.split(" ")
                if (!session_string.startsWith("Success")) {
                    $("#loginerror").html("Login Failed")
                    $("#loginerror").show()
                    return
                }
                $("#loginerror").hide()
                session = sections[1]

                // This needs to be set insecurely because we're not operating over https
                Cookies.set("cluster_storage_session_id", session, { secure: false })
                show_login()
            },
            error: function(message) {
                $("#loginerror").html("Login Failed")
                $("#loginerror").show()
            }
        }
    )
}

function update_folders(){

    $.ajax(
        {
            url: backend,
            method: "POST",
            data: {
                action: "list_folders",
                session: session
            },
            success: function(folders) {
                $("#projectbody").empty()

                let t = $('#projecttable').DataTable();
                t.clear()

                let dtnewdata = []
                for (let f in folders) {
                    let folder = folders[f]
                    dtnewdata.push(
                        [
                            folder["user"],
                            folder["folder"],
                            folder["bytes"],
                            folder["readable"],
                            folder["count"],
                            folder["modified"],
                            folder["types"]
                        ]
                    )
                }
                t.rows.add(dtnewdata).draw()
            },
            error: function(message) {
                $("#projectbody").clear()
            }
        }
    )

}