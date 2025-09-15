import { Hono } from 'hono';
import { DatabaseService } from '../utils/database';
import { homePage } from '../views/home';
import { Env } from '../types';

const main = new Hono<Env>();

main.get('/', async (c) => {
  const user = c.get('user');
  const db = new DatabaseService(c.env.DB);

  try {
    const photos = await db.getAllPhotos();
    return c.html(homePage(user, photos));
  } catch (error) {
    return c.html(homePage(user, []));
  }
});

export default main;