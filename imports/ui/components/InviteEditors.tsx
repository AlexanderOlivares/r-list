import React, { useCallback, useRef, useState } from "react";
import { Mentions } from "antd";
import debounce from "lodash.debounce";
import { Meteor } from "meteor/meteor";

interface IInviteEditorsProps {
  setEditorUsernameTags: React.Dispatch<React.SetStateAction<string[]>>;
}

const InviteEditors: React.FC<IInviteEditorsProps> = ({ setEditorUsernameTags }) => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<Meteor.User[]>([]);
  const [inputValue, setInputValue] = useState("");
  const ref = useRef<string>();

  const loadUsers = (key: string) => {
    if (!key) {
      setUsers([]);
      return;
    }

    Meteor.call("user.getUsers", (error: Meteor.Error | null, res: Meteor.User[]) => {
      if (error) {
        console.log(error.reason);
        throw new Meteor.Error("search-editors-error", "Error searching for users");
      } else {
        setLoading(false);
        setUsers(res);
      }
    });
  };

  const debounceLoadUsers = useCallback(debounce(loadUsers, 800), []);

  const handleChange = (value: string) => {
    setInputValue(value);
  };

  const onSearch = (search: string) => {
    ref.current = search;
    setLoading(!!search);
    setUsers([]);

    debounceLoadUsers(search);
  };

  const handleSelect = (username: string) => {
    setEditorUsernameTags(prev => Array.from(new Set([...prev, username])));
    setInputValue("");
  };

  return (
    <Mentions
      style={{ width: "100%" }}
      loading={loading}
      onSearch={onSearch}
      onChange={handleChange}
      value={inputValue}
      onSelect={option => option.key && handleSelect(option.key)}
      options={users.map(({ username }) => ({
        key: username,
        value: username,
        className: "antd-demo-dynamic-option",
        label: (
          <>
            <span>{username}</span>
          </>
        ),
      }))}
    />
  );
};

export default InviteEditors;
