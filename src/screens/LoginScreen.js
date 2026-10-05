// screens/LoginScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import { auth } from '../../firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isCadastro, setIsCadastro] = useState(false);

  const handleAutenticacao = () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    if (isCadastro) {
      createUserWithEmailAndPassword(auth, email, senha)
        .then(() => {
          Alert.alert('Sucesso', 'Conta criada com sucesso!');
          setIsCadastro(false);
        })
        .catch((error) => Alert.alert('Erro ao cadastrar', error.message));
    } else {
      signInWithEmailAndPassword(auth, email, senha)
        .then(() => navigation.replace('Home'))
        .catch((error) => Alert.alert('Erro ao entrar', error.message));
    }
  };

  return (
    <View style={styles.externo}>
      <View style={styles.container}>
        <Text style={styles.titulo}>{isCadastro ? 'Criar Conta' : 'Boas-vindas'}</Text>

        <TextInput
          placeholder="E-mail"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          placeholder="Senha"
          style={styles.input}
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        <View style={styles.areaBotao}>
          <Button
            title={isCadastro ? "Cadastrar" : "Entrar"}
            onPress={handleAutenticacao}
          />
        </View>

        <TouchableOpacity onPress={() => setIsCadastro(!isCadastro)} style={styles.alternarContainer}>
          <Text style={styles.alternarTexto}>
            {isCadastro ? "Já tem uma conta? Faça Login" : "Não tem uma conta? Cadastre-se"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  externo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', // Centraliza o bloco na horizontal na Web
    backgroundColor: '#f5f5f5'
  },
  container: {
    width: '100%',
    maxWidth: 400, // Impede que o formulário passe de 400px de largura
    padding: 30,
    backgroundColor: '#fff',
    borderRadius: 8,
    // Efeito de sombra leve para a Web
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 12,
    borderRadius: 6,
    backgroundColor: '#fff'
  },
  areaBotao: {
    marginTop: 8
  },
  alternarContainer: {
    marginTop: 20,
    alignItems: 'center'
  },
  alternarTexto: {
    color: '#007AFF',
    fontWeight: '600'
  }
});
