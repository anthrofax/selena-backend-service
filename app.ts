const express = require('express');

const app = express();

app.set('views', 'views');

app.get('/dashboard', (req: Request, res: Response) => {});
app.post('/insert-tokopedia', (req: Request, res: Response) => {});
app.post('/insert-shopee', (req: Request, res: Response) => {});