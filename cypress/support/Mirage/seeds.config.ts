import { Server } from 'miragejs';

export default function mirageDBSeeds(server: Server) {
  server.createList('project', 5);
  server.createList('file', 5);
}
