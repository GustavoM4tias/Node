const express = require('express');
const path = require('path');  // Importação do módulo 'path'
const db = require('./database');  // Conexão com o banco de dados

const app = express();

// Middleware para servir arquivos estáticos
app.use(express.static('public'));

// Middleware para parsear o corpo das requisições em formato JSON
app.use(express.json());

// Rota para obter todas as tarefas
app.get('/tarefas', (req, res) => {
    const tarefas = db.prepare('SELECT * FROM tarefas').all();
    res.json(tarefas);
});

// Rota para obter uma tarefa pelo ID
app.get('/tarefas/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const tarefa = db.prepare('SELECT * FROM tarefas WHERE id = ?').get(id);

    if (tarefa) {
        res.json(tarefa);
    } else {
        res.status(404).json({ mensagem: 'Tarefa não encontrada' });
    }
});

// Rota para adicionar uma nova tarefa
app.post('/tarefas', (req, res) => {
    const { nome, descricao } = req.body;

    if (!nome || !descricao) {
        return res.status(400).json({ mensagem: 'Nome e descrição são obrigatórios' });
    }

    const stmt = db.prepare('INSERT INTO tarefas (nome, descricao) VALUES (?, ?)');
    const info = stmt.run(nome, descricao);
    const novaTarefa = { id: info.lastInsertRowid, nome, descricao };

    res.status(201).json(novaTarefa);
});

// Rota para atualizar uma tarefa existente
app.put('/tarefas/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { nome, descricao } = req.body;

    const stmt = db.prepare('UPDATE tarefas SET nome = ?, descricao = ? WHERE id = ?');
    const info = stmt.run(nome, descricao, id);

    if (info.changes > 0) {
        res.json({ id, nome, descricao });
    } else {
        res.status(404).json({ mensagem: 'Tarefa não encontrada' });
    }
});

// Rota para excluir uma tarefa existente
app.delete('/tarefas/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);

    const stmt = db.prepare('DELETE FROM tarefas WHERE id = ?');
    const info = stmt.run(id);

    if (info.changes > 0) {
        res.status(204).end();
    } else {
        res.status(404).json({ mensagem: 'Tarefa não encontrada' });
    }
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ mensagem: 'Ocorreu um erro interno no servidor' });
});

// Iniciar o servidor
const port = process.env.PORT || 3000;  // Definindo a porta para ser dinâmica no Vercel
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
