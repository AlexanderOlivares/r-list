import React from 'react';
import { Document } from 'mongodb';

export const Task = ({ props }: { props: Document }) => {
  const { _id, text, userId } = props
  return (
    <div>
      <span>{text}</span><span><button>Edit</button></span><span><button>Delete</button></span>
    </div>
  )
};