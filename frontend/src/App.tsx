import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import './App.css'; // Supondo que você tenha um arquivo de estilo

// A interface Pessoa continua a mesma
interface Pessoa {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  dataNascimento: Date;
}

// --- ATUALIZADO ---
// Tipo para os dados do formulário, que não incluem o 'id'
type PessoaFormData = Omit<Pessoa, 'id'>;

const API_URL = 'http://localhost:3000';

function App() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [view, setView] = useState<'list' | 'form'>('list');
  // --- NOVO ESTADO ---
  // Guarda a pessoa que está sendo editada. Se for null, estamos criando uma nova.
  const [editingPessoa, setEditingPessoa] = useState<Pessoa | null>(null);

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

  // --- LÓGICA DE SALVAR ATUALIZADA ---
  // Agora se chama 'handleSave' para ser mais genérico (cria e atualiza)
  const handleSave = async (pessoaData: PessoaFormData) => {
    try {
      // Se 'editingPessoa' tiver um valor, estamos atualizando (PATCH)
      if (editingPessoa) {
        await fetch(`${API_URL}/pessoas/${editingPessoa.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pessoaData),
        });
      } else {
        // Se não, estamos criando (POST)
        await fetch(`${API_URL}/pessoas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pessoaData),
        });
      }
      // Limpa o estado de edição, atualiza a lista e volta para a tela de listagem
      setEditingPessoa(null);
      fetchPessoas();
      setView('list');
    } catch (error) {
      console.error("Erro ao salvar pessoa:", error);
    }
  };
  
  // --- NOVA FUNÇÃO PARA INICIAR A EDIÇÃO ---
  const handleEdit = (pessoa: Pessoa) => {
    setEditingPessoa(pessoa); // Guarda os dados da pessoa a ser editada
    setView('form');        // Muda para a tela do formulário
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

  // --- NOVA FUNÇÃO PARA CANCELAR A EDIÇÃO/CRIAÇÃO ---
  const handleCancel = () => {
    setEditingPessoa(null); // Limpa qualquer estado de edição
    setView('list');        // Volta para a lista
  }

  // --- RENDERIZAÇÃO DA UI ATUALIZADA ---
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
                    {/* 👇 ADICIONADO O BOTÃO DE EDITAR 👇 */}
                    <button className="edit-btn" onClick={() => handleEdit(pessoa)}>
                      Editar
                    </button>
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
        // Passamos os dados da pessoa e a função de salvar atualizada para o formulário
        <PessoaForm onSave={handleSave} onCancel={handleCancel} initialData={editingPessoa} />
      )}
    </div>
  );
}


// --- COMPONENTE DO FORMULÁRIO ATUALIZADO ---
interface PessoaFormProps {
  onSave: (pessoa: PessoaFormData) => void;
  onCancel: () => void;
  initialData: Pessoa | null; // Agora ele pode receber dados iniciais
}

function PessoaForm({ onSave, onCancel, initialData }: PessoaFormProps) {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    dataNascimento: '',
  });

  // --- NOVO useEffect ---
  // Preenche o formulário com os dados de edição quando o componente é montado no modo de edição
  useEffect(() => {
    if (initialData) {
      setFormData({
        nome: initialData.nome,
        cpf: initialData.cpf,
        email: initialData.email,
        // Formata o objeto Date para uma string 'YYYY-MM-DD' para o input
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
      {/* Altera o título dinamicamente */}
      <h2>{initialData ? 'Editar Pessoa' : 'Nova Pessoa'}</h2>
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