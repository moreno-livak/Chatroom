import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection, addDoc, onSnapshot, Timestamp,
  query, where, orderBy
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCe3G-n7IaZLVC4DL7bUNzV7OtaJos3hPo",
  authDomain: "netninja-45320.firebaseapp.com",
  projectId: "netninja-45320",
  storageBucket: "netninja-45320.appspot.com",
  messagingSenderId: "487294719780",
  appId: "1:487294719780:web:67850863854f744e3205b1"
};

initializeApp(firebaseConfig);
const db = getFirestore();
const colRef = collection(db, 'chats');




class Chatroom {
  constructor(room, username){
    this.room = room;
    this.username = username;
    this.chats = colRef;
    this.unsub;
  }

  async addChat(message){
    const now = new Date();
    const chat = {
      message: message,
      username: this.username,
      room: this.room,
      created_at: Timestamp.fromDate(now)
    };
    addDoc(colRef, chat);
  }

  async getChats(callback){
    const roomFilter = await query(colRef, where("room", "==", this.room));
    const ordered = await query(roomFilter, orderBy('created_at'));
    this.unsub = await onSnapshot(ordered, (snapshot) => {  // ohne await gefickt
      let items = []
      snapshot.docChanges().forEach(change => {
        if(change.type === 'added'){
          items.push({ ...change.doc.data(), id: change.doc.id })
      }})    
      callback(items);
      console.log(items);
    });
}

  updateName(username){
    this.username = username;
    localStorage.setItem('username', username);
  }

  updateRoom(room){
    this.room = room;
    console.log('room updated');
    if(this.unsub){
      this.unsub();
    }    
  }
}




class ChatUI {
  constructor(list) {
    this.list = list;
  }
  clear(){
    this.list.innerHTML = '';
  }
  async render(data){
    if(data.created_at){
      const when = dateFns.distanceInWordsToNow(
        data.created_at.toDate(),
        { addSuffix:true }
      );
          const html = `
      <li class="list-group-item">
        <span class="username">${data.username}</span>
        <span class="time">${when}</span><br>
        <p class="message">${data.message}</p>
      </li>
    `;
    this.list.innerHTML += html;
    }
  }
} 




// dom queries
const chatList = document.querySelector('.chat-list');
const newChatForm = document.querySelector('.new-chat');
const newNameForm = document.querySelector('.new-name');
const updateMssg = document.querySelector('.update-mssg');
const rooms = document.querySelector('.chat-rooms');


// Neuen Chat hinzufügen
newChatForm.addEventListener('submit', e => {
  e.preventDefault();
  const message = newChatForm.message.value.trim();
  chatroom.addChat(message)
    .then(() => newChatForm.reset())
    .catch(err => console.log(err));
})


// Nutzername hinzufügen
newNameForm.addEventListener('submit', e => {
  e.preventDefault();
  // Name updaten via chatroom...
  const newName = newNameForm.name.value.trim();
  chatroom.updateName(newName);
  newNameForm.reset();
  // Update Message kurz anzeigen
  updateMssg.innerText = `${newName} wurde als dein Name gespeichert`;
  setTimeout(() => updateMssg.innerText = '', 4000);
});

// Name von Local Storage wenn möglich
const username = localStorage.username ? localStorage.username : 'anon';


// Update Chatroom
rooms.addEventListener('click', e => {
  if(e.target.tagName === 'BUTTON'){
    chatUI.clear();
    chatroom.updateRoom(e.target.getAttribute('id'));
    chatroom.getChats(data => data.forEach(chat => {chatUI.render(chat);}));
  }
});




const chatroom = new Chatroom('general', username);
const chatUI = new ChatUI(chatList);

chatroom.getChats(data => data.forEach(chat => {chatUI.render(chat);}));
