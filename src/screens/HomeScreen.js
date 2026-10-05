// screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text, TouchableOpacity, StyleSheet, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
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
    setIdEditando(null);
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
        const contatoRef = doc(db, 'contatos', idEditando);
        await updateDoc(contatoRef, dadosContato);
      } else {
        const colecaoRef = collection(db, 'contatos');
        await addDoc(colecaoRef, dadosContato);
      }
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
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.externo}
    >
      <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />
      
      {/* Barra Superior Estilizada */}
      <View style={styles.barraSuperior}>
        <View>
          <Text style={styles.tituloApp}>Minha Agenda</Text>
          <Text style={styles.subtitulo}>Gerencie seus contatos</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.btnLogout}>
          <Text style={styles.btnLogoutTxt}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        {/* Seção do Formulário */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>
            {idEditando ? "✏️ Editando Contato" : "➕ Novo Contato"}
          </Text>
          <TextInput
            placeholder="Nome Completo"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            value={nome}
            onChangeText={setNome}
          />
          <TextInput
            placeholder="E-mail"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Telefone"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            value={telefone}
            onChangeText={setTelefone}
            keyboardType="phone-pad"
          />
          
          <View style={styles.areaBotoesForm}>
            <TouchableOpacity 
              style={[styles.btnPrincipal, idEditando ? styles.btnEdicao : styles.btnCriacao]} 
              onPress={salvarContato}
            >
              <Text style={styles.btnPrincipalTxt}>
                {idEditando ? "Salvar Alterações" : "Adicionar Contato"}
              </Text>
            </TouchableOpacity>

            {idEditando && (
              <TouchableOpacity style={styles.btnCancelar} onPress={limparFormulario}>
                <Text style={styles.btnCancelarTxt}>Cancelar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Título da Lista */}
        <Text style={styles.secaoTitulo}>Contatos Salvos ({contatos.length})</Text>

        {/* Listagem */}
        <FlatList
          data={contatos}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
          renderItem={({ item }) => (
            <View style={styles.cardItem}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarTxt}>{item.nome.charAt(0).toUpperCase()}</Text>
              </View>
              
              <View style={styles.infoContainer}>
                <Text style={styles.txtNome} numberOfLines={1}>{item.nome}</Text>
                <Text style={styles.txtDetalhes} numberOfLines={1}>✉️ {item.email}</Text>
                <Text style={styles.txtDetalhes} numberOfLines={1}>📱 {item.telefone}</Text>
              </View>
              
              <View style={styles.botoesContainer}>
                <TouchableOpacity onPress={() => iniciarEdicao(item)} style={styles.btnAcaoEditar}>
                  <Text style={styles.btnAcaoTxt}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deletarContato(item.id)} style={styles.btnAcaoDeletar}>
                  <Text style={styles.btnAcaoTxt}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  externo: { 
    flex: 1, 
    backgroundColor: '#F3F4F6' 
  },
  barraSuperior: { 
    width: '100%', 
    backgroundColor: '#4F46E5', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 50, 
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: { ios: 0.1, android: 0.2 },
    shadowRadius: 6,
    elevation: 5,
  },
  tituloApp: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#FFFFFF' 
  },
  subtitulo: { 
    fontSize: 13, 
    color: '#E0E7FF', 
    marginTop: 2 
  },
  btnLogout: { 
    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
    paddingVertical: 8, 
    paddingHorizontal: 16, 
    borderRadius: 20 
  },
  btnLogoutTxt: { 
    color: '#FFFFFF', 
    fontWeight: '600', 
    fontSize: 14 
  },
  container: { 
    flex: 1, 
    width: '100%', 
    maxWidth: 650, 
    alignSelf: 'center',
    paddingHorizontal: 16, 
    paddingTop: 16 
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    padding: 12, 
    marginBottom: 12, 
    borderRadius: 10, 
    backgroundColor: '#F9FAFB', 
    fontSize: 15,
    color: '#1F2937'
  },
  areaBotoesForm: { 
    flexDirection: 'row', 
    gap: 10, 
    marginTop: 4 
  },
  btnPrincipal: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCriacao: {
    backgroundColor: '#4F46E5',
  },
  btnEdicao: {
    backgroundColor: '#D97706',
  },
  btnPrincipalTxt: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  btnCancelar: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancelarTxt: {
    color: '#4B5563',
    fontWeight: '600',
    fontSize: 15,
  },
  secaoTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 8,
    marginLeft: 4,
  },
  cardItem: { 
    flexDirection: 'row', 
    backgroundColor: '#FFFFFF', 
    marginBottom: 10, 
    borderRadius: 12, 
    padding: 14, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarTxt: {
    color: '#4F46E5',
    fontWeight: 'bold',
    fontSize: 18,
  },
  infoContainer: { 
    flex: 1, 
    paddingRight: 8 
  },
  txtNome: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#1F2937', 
    marginBottom: 2 
  },
  txtDetalhes: { 
    fontSize: 13, 
    color: '#6B7280', 
    marginTop: 1 
  },
  botoesContainer: { 
    flexDirection: 'row', 
    gap: 6 
  },
  btnAcaoEditar: { 
    backgroundColor: '#FEF3C7', 
    padding: 8, 
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  btnAcaoDeletar: { 
    backgroundColor: '#FEE2E2', 
    padding: 8, 
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  btnAcaoTxt: { 
    fontSize: 14 
  }
});
