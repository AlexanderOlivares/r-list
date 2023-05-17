import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';

interface IEditors {
  email: string;
  isBanned: boolean;
  // Editor may not have account yet
  editorId?: string;
  editorUsername?: string;
}

export interface INewList {
  listName: string;
  editors: IEditors[];
  editorsCanInvite: boolean,
}

export default function NewList() {
  const navigate = useNavigate();
  const [listName, setListName] = useState("");
  const [editorsEmailAddresses, setEditorsEmailAddresses] = useState<string[]>([]);

  const makeNewList = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const editors: IEditors[] = editorsEmailAddresses.map(email => {
      // TODO check if editors email is in db
      // if so, add editor's _id and username here
      return {
        email,
        isBanned: false
      }
    })

    const newList: INewList = {
      listName,
      editors,
      editorsCanInvite: false,
    }


    Meteor.call('lists.insert', newList, (error: Meteor.Error | null, result: string) => {
      if (error) {
        console.log(error.reason);
      } else {
        const listId = result;
        navigate(`/lists/${listId}`)
      }
    })
  }

  const handleEditorEmails: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const emails = e.target.value;
    // TODO make this better with multi input chips 

    setEditorsEmailAddresses([emails]);
  }

  return (
    <form className="task-form" onSubmit={makeNewList}>
      <h3>Name Your List</h3>
      <input
        value={listName}
        onChange={(e) => setListName(e.target.value)}
        type="text"
        placeholder="Grocery List"
      />
      <h5>Invite friends to edit</h5>
      <input
        value={editorsEmailAddresses}
        onChange={handleEditorEmails}
        type="text"
        placeholder="Editor's Email"
        name="editors"
      />

      <button type="submit">Create List</button>
    </form>
  )
}
