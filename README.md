# CIOIDS - A Simple ID-Generating Server
CIOIDS is a simple server that generates IDs based on name and birthdate.
The server is deployed for the EU project, Common Interaction Objects (CIO).

## Annonymity
The ID service is meant to provide an easy way of generating annonymized userIDs that can be used for data collection.
The service uses a given participant's name (know by researchers and participant), the participant's date of birth (knowm only by the participant), and a salt (known only by the researchers).
Hence, it is possible to identify participants who participate in several studies within in project, but not possible for the researchers who indentify the participant behind a specific user ID.
The name + birthdate + salt is hashed using SHA-1.

## The Service
The server provides three services.
* GET on <hostname(:port)> will provide a user interface for creating new userID
* GET on <hostname(:port)>/<userID> will return a JSON declaring whether the userID already exists a a timestamp of its first occurence in the database
* POST to <hostname(:port)>/post will create a new userID if provided with a JSON-string containing {"namestring":name,"datestring":dateofbirth}

