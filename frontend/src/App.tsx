import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import './App.css';

interface Pessoa {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  dataNascimento: Date;
}

type PessoaFormData = Omit<Pessoa, 'id'>;

const API_URL = 'http://localhost:3000';

function App() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingPessoa, setEditingPessoa] = useState<Pessoa | null>(null);
  const [erros, setErros] = useState<string[]>([]);

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

  const handleSave = async (pessoaData: PessoaFormData) => {
    try {
      const response = await fetch(
        editingPessoa ? `${API_URL}/pessoas/${editingPessoa.id}` : `${API_URL}/pessoas`,
        {
          method: editingPessoa ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pessoaData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (Array.isArray(errorData.message)) {
          setErros(errorData.message);
        } else {
          setErros([errorData.message || 'Erro desconhecido']);
        }
        return;
      }

      setErros([]);
      setEditingPessoa(null);
      fetchPessoas();
      setView('list');
    } catch (error) {
      console.error("Erro ao salvar pessoa:", error);
      setErros(['Erro ao salvar.']);
    }
  };

  const handleEdit = (pessoa: Pessoa) => {
    setEditingPessoa(pessoa);
    setView('form');
    setErros([]);
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

  const handleCancel = () => {
    setEditingPessoa(null);
    setView('list');
    setErros([]);
  };

  return (
    <div className="container">
      <h1>CRUD de Pessoas com TDD</h1>
      {view === 'list' ? (
        <>
          <button onClick={() => {
            setView('form');
            setEditingPessoa(null);
            setErros([]);
          }}>Nova Pessoa</button>
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
                    <button className="edit-btn" onClick={() => handleEdit(pessoa)}>Editar</button>
                    <button className="remove-btn" onClick={() => handleRemovePessoa(pessoa.id)}>Remover</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <PessoaForm
          onSave={handleSave}
          onCancel={handleCancel}
          initialData={editingPessoa}
          erros={erros}
        />
      )}
    </div>
  );
}

interface PessoaFormProps {
  onSave: (pessoa: PessoaFormData) => void;
  onCancel: () => void;
  initialData: Pessoa | null;
  erros?: string[];
}

function PessoaForm({ onSave, onCancel, initialData, erros }: PessoaFormProps) {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    dataNascimento: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        nome: initialData.nome,
        cpf: initialData.cpf,
        email: initialData.email,
        dataNascimento: new Date(initialData.dataNascimento).toISOString().split('T')[0],
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, dataNascimento: new Date(formData.dataNascimento) });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{initialData ? 'Editar Pessoa' : 'Nova Pessoa'}</h2>

      {erros && erros.length > 0 && (
        <div data-testid="erros-validacao" className="erro-box">
          <ul>
            {erros.map((erro, index) => (
              <li key={index}>{erro}</li>
            ))}
          </ul>
        </div>
      )}

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
