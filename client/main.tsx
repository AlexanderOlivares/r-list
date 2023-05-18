import React from 'react';
import { createRoot } from 'react-dom/client';
import { Meteor } from 'meteor/meteor';
import { App } from '../imports/ui/App';
import { UserContextProvider } from '../context/UserContext';

Meteor.startup(() => {
  const container = document.getElementById('react-target');
  if (container instanceof HTMLElement) {
    const root = createRoot(container);
    root.render(
      <UserContextProvider>
        <App />
      </UserContextProvider>
    );
  } else {
    console.error("Element 'react-target' not found.")
  }
});
