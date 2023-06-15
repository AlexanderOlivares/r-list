import { Meteor } from "meteor/meteor";
import { IEditor } from "./components/NewList";
import { useState, useEffect } from "react";

export const EMAIL_VALIDATOR = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

/*
See if editor is already a user, and if so add their userId to the editor base
*/
export async function buildEditorBase(usernameOrEmail: string) {
  const isEmail = /@/g.test(usernameOrEmail);

  const editorBase: IEditor = {
    ...(isEmail ? { email: usernameOrEmail } : { editorUsername: usernameOrEmail }),
  };

  try {
    let editorId, editorUsername;

    await new Promise<Meteor.User>((resolve, reject) => {
      Meteor.call("user.findUser", usernameOrEmail, (error: Meteor.Error, result: Meteor.User) => {
        if (error) {
          console.log(error.reason);
          reject(error.reason);
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
      ...(editorUsername ? { editorUsername } : {}),
    };
  } catch (error) {
    console.log(error);
    return editorBase;
  }
}

export default function useMediaQuery(maxWidth: number) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${maxWidth}px)`);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => {
      setMatches(media.matches);
    };
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, maxWidth]);

  return matches;
}
