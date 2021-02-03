import React from 'react'

export class Domain extends React.Component {
  // static BACKEND = window.location.protocol + "//" + window.location.host.split(":")[0] + '/backend/public';
  static BACKEND = "http://127.0.0.1:8000/";
  static FRONTEND = window.location.origin;
}
