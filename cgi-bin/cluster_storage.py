#!/usr/bin/env python3
import pam
import random
import shutil
from pathlib import Path
from json import dumps
import cgi
import cgitb
cgitb.enable()

storage_folder = "/bi/home/andrewss/Storage/"
sessions_file = "/bi/home/andrewss/Storage/cluster_storage/sessions.txt"

def main():
    form = cgi.FieldStorage()

    if not "action" in form:
        send_response(False,"No Action")
        return

    if form["action"].value == "login":
        process_login(form["username"].value,form["password"].value)

    elif form["action"].value == "validate_session":
        person = checksession(form["session"].value)
        send_response(True,person)

    else:
        # Everything else needs validation so let's check that first
        person = checksession(form["session"].value)
        if person is None:
            send_response(False,"Unknown session")
        
        elif form["action"].value == "list_folders":
            list_folders(person)



def send_response(success,message):
    if success:
        print("Content-type: text/plain; charset=utf-8\n\nSuccess: "+message, end="")
    else:
        print("Content-type: text/plain; charset=utf-8\n\nFail: "+message, end="")

def send_json(data):
    print("Content-type: text/json; charset=utf-8\n\n"+dumps(data))

    
def list_folders(person):
    folders = []

    report_file = Path(storage_folder+f"storage_report_{person}.txt")

    if report_file.is_file():
        with open(report_file) as infh:
            for i,line in enumerate(infh):
                if i==0:
                    continue
                
                sections = line.strip().split("\t")
                folders.append({
                    "user": sections[0],
                    "folder": sections[1],
                    "bytes": sections[2],
                    "readable": sections[3],
                    "count": sections[4],
                    "modified": sections[5],
                    "types": sections[6]
                })

    send_json(folders)

def process_login (username,password):

    # Check the password
    p = pam.pam()
    if p.authenticate(username,password):
        sessioncode = generate_id(20)
        tempfile = sessions_file+"sessioncode"
        with open(tempfile,"w") as out:
            with open(sessions_file) as sf:
                for line in sf:
                    if line.startswith(username):
                        continue
                    out.write(line)
            
            print(f"{username}\t{sessioncode}",file=out)
        shutil.move(tempfile,sessions_file)

        send_response(True,sessioncode)
    else:
        send_response(False,"Incorrect login")


def checksession (sessioncode):

    with open(sessions_file) as infh:
        for line in infh:
            line = line.strip()
            username,session = line.split("\t")
            if session == sessioncode:
                return username

    return None



def generate_id(size):
    """
    Generic function used for creating IDs
    """
    letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

    code = ""

    for _ in range(size):
        code += random.choice(letters)

    return code




if __name__ == "__main__":
    main()