
import './App.css';
import React, { useEffect, useState } from 'react';
//For check your browser support these browers?
const idb = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
console.log("index", idb);
const createCollectionsIndexDB = () => {
  if (!idb) {
    console.log("Your Brwoser does not support indexdb")
    //i'm using return to stop this if condition false
    return;
  }
  //.open is used to make a database and pass two parameters
  const request = idb.open('test-db', 2);
  request.onerror = (err) => {
    console.log("Error", err);
    console.log("An error occurred with indexdb");
  }
  // want to update DB
  request.onupgradeneeded = (event) => {
    const db = request.result;
    //collections another name is objectStore
    if (!db.objectStoreNames.contains('userData')) {
      db.createObjectStore('userData', {
        keyPath: "id"
      });
    }
  }
  request.onsuccess = () => {
    console.log("database opened successfully");
  }
}
function App() {
  useEffect(() => {
    createCollectionsIndexDB();
    getAllData();
  }, [])
  // states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [allUserData, setAllUserData] = useState([]);
  const [addUser, setAddUser] = useState(false);
  const [editUser, setEditUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  const getAllData = () => {
    const dbPromise = idb.open('test-db', 2);
    dbPromise.onsuccess = () => {
      const db = dbPromise.result;
      const tx = db.transaction('userData', 'readonly');
      const userData = tx.objectStore('userData');
      const users = userData.getAll();
      users.onsuccess = (query) => {
        setAllUserData(query.srcElement.result);
      }
      users.onerror = (error) => {
        alert("Error occured while getting all initial user data")
      }
      tx.oncomplete = () => { db.close(); }

    }
  }
  const handleSubmit = (event) => {
    const dbPromise = idb.open('test-db', 2);
    if (firstName && lastName && email) {
      dbPromise.onsuccess = () => {
        const db = dbPromise.result;
        const tx = db.transaction('userData', 'readwrite');
        const userData = tx.objectStore('userData');


        if (addUser) {

          const users = userData.put({
            // id: 1,
            id: allUserData?.length + 1,
            firstName,
            lastName,
            email
          })
          users.onsuccess = () => {
            tx.oncomplete = () => {
              db.close();
            }
            getAllData();
            alert('user added successfully')
          }
          users.onerror = (err) => {
            console.log(err)
            alert('error adding user')
          }
        } else {
          const users = userData.put({
            // id: 1,
            id: selectedUser?.id,
            firstName,
            lastName,
            email
          })
          users.onsuccess = () => {
            tx.oncomplete = () => {
              db.close();
            }
            getAllData();
            alert('user updated successfully')
          }
          users.onerror = (err) => {
            console.log(err)
            alert('error adding user')
          }
        }
      }
    }
  }
  const deleteUserHandler = (user) => {
    const dbPromise = idb.open('test-db', 2);
    dbPromise.onsuccess = () => {
      const db = dbPromise.result;
      const tx = db.transaction('userData', 'readwrite');
      const userData = tx.objectStore('userData');
      const deleteUser = userData.delete(user?.id);
      deleteUser.onsuccess = (query) => {
        alert('user deleted successfully');
        getAllData();
      }
      deleteUser.onerror = (error) => {
        alert("Error occured while getting all initial user data")
      }
      tx.oncomplete = () => { db.close(); }

    }
  }
  return (
    <div className='row' style={{ padding: 100 }}>
      <div className='col-md-6 '>
        <button className='btn btn-primary float-end mb-2' onClick={() => {
          setAddUser(true);
          setEditUser(false);
          setSelectedUser({});
          setFirstName('');
          setLastName('');
          setEmail('');
        }}>Add</button>
        <table className='table table-bordered'>
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {allUserData?.map(row => (
              <tr key={row?.id}>
                <td>{row?.firstName}</td>
                <td>{row?.lastName}</td>
                <td>{row?.email}</td>
                <td><button className='btn btn-success' onClick={() => {
                  setAddUser(false);
                  setEditUser(true);
                  setSelectedUser(row);
                  setFirstName(row?.firstName);
                  setLastName(row?.lastName);
                  setEmail(row?.email);
                }}>Edit</button>{' '}
                  <button className='btn btn-danger' onClick={() => {
                    deleteUserHandler(row);
                  }}>Delete</button>
                </td>
              </tr>)
            )}
          </tbody>
        </table>
      </div>
      <div className='col-md-6'>
        {addUser || editUser ?
          <div className='card' style={{ padding: '20px' }}>
            <h3>{editUser ? 'Update User' : 'Add User'}</h3>
            <div className='form-group'>
              <label>First Name</label>
              <input type='text' name='firstName' className='form-control' value={firstName} onChange={e => setFirstName(e.target.value)} />
            </div>
            <div className='form-group'>
              <label>Last Name</label>
              <input type='text' name='firstName' className='form-control' value={lastName} onChange={e => setLastName(e.target.value)} />
            </div>
            <div className='form-group'>
              <label>Email</label>
              <input type='text' name='firstName' className='form-control' value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className='form-group'>
              <button className='btn btn-primary mt-2' onClick={handleSubmit}>{editUser ? 'Update' : 'Add'}</button>
            </div>
          </div>
          : null
        }
      </div>
    </div >
  );
}

export default App;
