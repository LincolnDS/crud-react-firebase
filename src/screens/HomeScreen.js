// screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { db, auth } from '../../firebaseConfig';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

export default function HomeScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');

  const [idEditando, setIdEditando] = useState(null);
  const [contatos, setContatos] = useState([]);

  // LER (Tempo real do Firestore)
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'contatos'), (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setContatos(lista);
    });
    return () => unsubscribe();
  }, []);

  // FUNÇÃO AUXILIAR PARA LIMPAR FORMULÁRIO
  const limparFormulario = () => {
    setNome('');
    setEmail('');
    setTelefone('');
    setIdEditando(null); // Garante que o app volta para o modo "Adicionar"
  };

  // CRIAR OU ATUALIZAR
  const salvarContato = async () => {
    if (!nome.trim() || !email.trim() || !telefone.trim()) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    const dadosContato = { nome, email, telefone };

    try {
      if (idEditando !== null && idEditando !== '') {
        // FLUXO DE ATUALIZAÇÃO (U)
        const contatoRef = doc(db, 'contatos', idEditando);
        await updateDoc(contatoRef, dadosContato);
      } else {
        // FLUXO DE CRIAÇÃO (C)
        const colecaoRef = collection(db, 'contatos');
        await addDoc(colecaoRef, dadosContato);
      }

      // Limpa os campos e redefine o estado de forma estrita
      limparFormulario();
    } catch (error) {
      console.error("Erro na operação:", error);
      alert('Erro ao salvar dados no Firestore.');
    }
  };

  // EXCLUIR
  const deletarContato = async (id) => {
    try {
      await deleteDoc(doc(db, 'contatos', id));
      if (idEditando === id) {
        limparFormulario();
      }
    } catch (error) {
      console.error("Erro ao remover:", error);
    }
  };

  // PREPARAR EDIÇÃO
  const iniciarEdicao = (contato) => {
    setIdEditando(contato.id);
    setNome(contato.nome);
    setEmail(contato.email);
    setTelefone(contato.telefone);
  };

  // LOGOUT
  const handleLogout = () => {
    signOut(auth)
      .then(() => navigation.replace('Login'))
      .catch((error) => console.error(error));
  };

  return (
    <View style={styles.externo}>
      <View style={styles.barraSuperior}>
        <Text style={styles.subtitulo}>Cadastro de Contatos</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.btnLogout}>
          <Text style={styles.btnLogoutTxt}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        {/* Formulário */}
        <TextInput
          placeholder="Nome Completo"
          style={styles.input}
          value={nome}
          onChangeText={setNome}
        />
        <TextInput
          placeholder="E-mail"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Telefone"
          style={styles.input}
          value={telefone}
          onChangeText={setTelefone}
          keyboardType="phone-pad"
        />

        {/* Renderização condicional de botões dependendo do estado */}
        <View style={styles.areaBotoesForm}>
          <View style={{ flex: 1 }}>
            <Button
              title={idEditando ? "Salvar Alterações" : "Adicionar Contato"}
              onPress={salvarContato}
              color={idEditando ? "#f0ad4e" : "#007AFF"}
            />
          </View>
          {idEditando && (
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Button
                title="Cancelar"
                onPress={limparFormulario}
                color="gray"
              />
            </View>
          )}
        </View>

        {/* Listagem */}
        <FlatList
          data={contatos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <View style={styles.cardItem}>
              <View style={styles.infoContainer}>
                <Text style={styles.txtNome}>{item.nome}</Text>
                <Text style={styles.txtDetalhes}>📧 {item.email}</Text>
                <Text style={styles.txtDetalhes}>📞 {item.telefone}</Text>
              </View>

              <View style={styles.botoesContainer}>
                <TouchableOpacity onPress={() => iniciarEdicao(item)} style={styles.btnEditar}>
                  <Text style={styles.btnTxt}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deletarContato(item.id)} style={styles.btnDeletar}>
                  <Text style={styles.btnTxt}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  externo: { flex: 1, alignItems: 'center', backgroundColor: '#f5f5f5' },
  barraSuperior: { width: '100%', maxWidth: 600, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 20, marginBottom: 10 },
  container: { width: '100%', maxWidth: 600, paddingHorizontal: 20 },
  subtitulo: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  btnLogout: { backgroundColor: '#d9534f', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 6 },
  btnLogoutTxt: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, marginBottom: 10, borderRadius: 6, backgroundColor: '#fff', fontSize: 15 },
  areaBotoesForm: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  cardItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', marginTop: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#e0e0e0' },
  infoContainer: { flex: 1, paddingRight: 10 },
  txtNome: { fontSize: 16, fontWeight: 'bold', color: '#222', marginBottom: 4 },
  txtDetalhes: { fontSize: 14, color: '#666', marginTop: 2 },
  botoesContainer: { flexDirection: 'row', gap: 8 },
  btnEditar: { backgroundColor: '#f0ad4e', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 4 },
  btnDeletar: { backgroundColor: '#d9534f', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 4 },
  btnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 13 }
});
