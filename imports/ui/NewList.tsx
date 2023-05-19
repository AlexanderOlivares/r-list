import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';

export interface IEditor {
  email: string;
  // Editor may not have account yet
  editorId?: string;
  editorUsername?: string;
}

export interface INewList {
  listName: string;
  editors: IEditor[];
  editorsCanInvite: boolean,
}

export default function NewList() {
  const navigate = useNavigate();
  const [listName, setListName] = useState("");
  const [editorsEmailAddresses, setEditorsEmailAddresses] = useState<string[]>([]);
  const [editorsCanInvite, setEditorsCanInvite] = useState(true);

  const makeNewList = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    (async () => {
      const editors: IEditor[] = await Promise.all(
        editorsEmailAddresses.map(async (email) => {

          const editorBase: IEditor = { email }

          try {
            let editorId, editorUsername;

            await new Promise<Meteor.User>((resolve, reject) => {
              Meteor.call('user.findUser', email, (error: Meteor.Error, result: Meteor.User) => {
                if (error) {
                  console.log(error.reason);
                  reject(error);
                } else {
                  editorId = result._id;
                  editorUsername = result.username;
                  resolve(result);
                }
              });
            });

            return {
              ...editorBase,
              ...(editorId ? { editorId } : {}),
              ...(editorUsername ? { editorUsername } : {})
            }
          } catch (error) {
            console.log(error);
            return editorBase
          }
        })
      );

      const newList: INewList = {
        listName,
        editors,
        editorsCanInvite
      }

      Meteor.call('lists.insert', newList, (error: Meteor.Error, result: string) => {
        if (error) {
          console.log(error.reason);
        } else {
          const listId = result;
          navigate(`/lists/${listId}`)
        }
      })
    })();

  }

  const handleEditorEmails: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const emails = e.target.value;
    // TODO make this better with multi input chips 

    setEditorsEmailAddresses([emails]);
  }

  // TODO make input to use setEditorsCanInvite

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
