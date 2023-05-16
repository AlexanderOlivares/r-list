import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';

export interface INewList {
  listName: string;
  editors: string[];
  editorsCanInvite: boolean,
}

export default function NewList() {
  const navigate = useNavigate();
  const [listName, setListName] = useState("");
  const [editorsEmailAddresses, setEditorsEmailAddresses] = useState<string[]>([]);

  const makeNewList = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newList: INewList = {
      listName,
      editors: editorsEmailAddresses,
      editorsCanInvite: false,
    }


    Meteor.call('lists.insert', newList, (error: Meteor.Error | null, result: string) => {
      if (error) {
        console.log(error.reason);
      } else {
        const listId = result;
        console.log("list insert result ", result)
        navigate(`/lists/${listId}`)
        setListName("");
        setEditorsEmailAddresses([]);
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
        placeholder="Type to add new tasks"
      />
      <h5>Invite friends to edit</h5>
      <input
        value={editorsEmailAddresses}
        onChange={handleEditorEmails}
        type="text"
        placeholder="Editor's Email"
        name="editors"
      />

      <button type="submit">New Task</button>
    </form>
  )
}
