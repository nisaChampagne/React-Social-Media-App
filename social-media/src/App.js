import React, { useState, useEffect} from 'react';
import logo from './logo.svg';
import axios from 'axios'
import './App.css';

function App() {

  const [data, setData] = useState([]);

  // useEffect(() => {
  //     console.log('Effect')
  //   axios.get('https://us-central1-socialmediaapp-9cf68.cloudfunctions.net/getScreams')
  //     .then (res => {
  //       const data = res.data;
  //       console.log('GUUD', res.data);      
  //           setData(data)
  //     })
  //     .catch(error => {
  //       console.log("Oopsie ", error);
  //     });

  // },[]);

  return (
    <div className="App">
      <h1>Hey</h1>
    </div>
  );
}

export default App;
