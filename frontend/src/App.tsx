import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';

// Define a "forma" de um objeto Pessoa no frontend
interface Pessoa {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  dataNascimento: string;
}

// URL base da sua API backend
const API_URL = 'http://localhost:3000'; // ATENÇÃO: Verifique se a porta é a mesma do seu backend

function App() {
  // --- ESTADOS DO COMPONENTE ---
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [view, setView] = useState<'list' | 'form'>('list');

  // --- FUNÇÕES DE API ---
  const fetchPessoas = async () => {
    try {
      const response = await fetch(`${API_URL}/pessoas`);
      if (!response.ok) throw new Error('Falha ao buscar dados');
      const data = await response.json();
      setPessoas(data);
    } catch (error) {
      console.error("Erro ao buscar pessoas:", error);
    }
  };

  useEffect(() => {
    fetchPessoas();
  }, []);

  const handleSavePessoa = async (novaPessoa: Omit<Pessoa, 'id'>) => {
    try {
      await fetch(`${API_URL}/pessoas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaPessoa),
      });
      fetchPessoas();
      setView('list');
    } catch (error) {
      console.error("Erro ao salvar pessoa:", error);
    }
  };

  const handleRemovePessoa = async (id: string) => {
    if (window.confirm("Tem certeza que deseja remover esta pessoa?")) {
      try {
        await fetch(`${API_URL}/pessoas/${id}`, {
          method: 'DELETE',
        });
        fetchPessoas();
      } catch (error) {
        console.error("Erro ao remover pessoa:", error);
      }
    }
  };

  // --- RENDERIZAÇÃO DA UI ---
  return (
    <div className="container">
      <h1>CRUD de Pessoas com TDD</h1>
      {view === 'list' ? (
        <>
          <button onClick={() => setView('form')}>Nova Pessoa</button>
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>E-mail</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pessoas.map((pessoa) => (
                <tr key={pessoa.id}>
                  <td>{pessoa.nome}</td>
                  <td>{pessoa.cpf}</td>
                  <td>{pessoa.email}</td>
                  <td>
                    <button className="remove-btn" onClick={() => handleRemovePessoa(pessoa.id)}>
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <PessoaForm onSave={handleSavePessoa} onCancel={() => setView('list')} />
      )}
    </div>
  );
}

// --- COMPONENTE DO FORMULÁRIO ---
interface PessoaFormProps {
  onSave: (pessoa: Omit<Pessoa, 'id'>) => void;
  onCancel: () => void;
}

function PessoaForm({ onSave, onCancel }: PessoaFormProps) {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    dataNascimento: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({ ...formData }); 
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Nova Pessoa</h2>
      <div>
        <label>Nome:</label>
        <input type="text" name="nome" value={formData.nome} onChange={handleChange} required />
      </div>
      <div>
        <label>CPF:</label>
        <input type="text" name="cpf" value={formData.cpf} onChange={handleChange} required />
      </div>
      <div>
        <label>E-mail:</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} required />
      </div>
      <div>
        <label>Data de Nascimento:</label>
        <input type="date" name="dataNascimento" value={formData.dataNascimento} onChange={handleChange} required />
      </div>
      <div className="form-buttons">
        <button type="submit">Salvar</button>
        <button type="button" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}

export default App;