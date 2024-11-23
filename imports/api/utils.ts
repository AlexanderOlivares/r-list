import { Meteor } from "meteor/meteor";
import { ListsCollection } from "./collections/ListsCollection";
import { IEditor } from "../ui/components/NewList";
import { Email } from "meteor/email";

export function userIsListOwner(listId: string, attemptedAction: string) {
  const userId = Meteor.userId();
  const dbList = ListsCollection.findOne({ _id: listId }, { fields: { ownerId: 1 } });

  if (!userId) {
    throw new Meteor.Error("Error finding current user");
  }

  if (!dbList) {
    throw new Meteor.Error("Error finding current list");
  }

  if (userId !== dbList.ownerId) {
    throw new Meteor.Error(`User unauthorized to ${attemptedAction} `);
  }

  return true;
}

export async function sendInviteEmail(editor: IEditor, listOwner?: string, inviter?: string) {
  try {
    let email = editor.email;

    if (!editor.email) {
      const user = Meteor.users.findOne({
        $or: [{ _id: editor.editorId }, { username: editor.editorUsername }],
      });

      if (user?.emails?.[0]?.address) {
        email = user?.emails?.[0]?.address;
      }
    }

    if (!email) return;

    const inviterIsListOwner = listOwner === inviter;

    const url = Meteor.settings.public.url;
    const subject = `${inviter} invited you to a shared list`;
    const html = `Signup or login at <a href="${url}">${url}</a> to collaborate with ${inviter} on a shared list${
      !inviterIsListOwner ? " created by " + listOwner + "." : "."
    }`;

    Email.send({ to: email, from: "noreply@rlist.lol", subject, html });
  } catch (error) {
    console.log(error);
  }
}
