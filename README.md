# Cluster Storage Report

This is a small web front end which allows our cluster users to see what data they are storing 
on the cluster so they can manage it more easily.  It displays the data produced by our separate
nightly stats collection cron job which can be found in our [cluster management repository](https://github.com/s-andrews/stonecluster/).

Setup
=====

To set this up you need to check out this code onto the cluster - just in a normal user account is fine.

There are a couple of preferences you need to set at the top of the ```cluster_storage.py``` file, namely
the folder where the storage reports are collected, and the file you want to use to store session ids. You
will need to ensure that you have read permissions to the first of these, and write permission to the 
second.

On our cluster I run this on a non-standard port just using the python http server.  It gets tiny amounts
of traffic and I'm not worried about logging.  Launching the server can be done from within the top level
clusterstorage directory with:

```
nohup python -m http.server --cgi > /dev/null &
```

..and that should be it.
