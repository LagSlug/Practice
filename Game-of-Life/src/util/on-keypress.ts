
import readline, { Key } from 'readline';

type Listener = (ch: string | undefined, key: Key)=>void;
const listeners: Listener[] = [];

readline.emitKeypressEvents(process.stdin);
process.stdin.on('keypress', (ch: string | undefined, key: Key) => {

  listeners.forEach(listener=>listener(ch, key));

  if (key && key.ctrl && key.name == 'c') {
    // required to end the application using ctrl-c
    process.stdin.pause();
    process.exit();
  }
});
process.stdin.setRawMode(true);


export default function addOnKeypressListener(listener: Listener) {
  const index = listeners.length;
  listeners.push(listener);
  return () => {
    listeners.splice(index, 1);
  }
}
