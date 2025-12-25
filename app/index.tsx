import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

type Game = {
  id: string;
  title: string;
  description: string;
  route: string;
  emoji: string;
};

const GAMES: Game[] = [
  {
    id: 'connect-four',
    title: 'Connect Four',
    description: 'Connect 4 dots in a row to win!',
    route: '/connect-four',
    emoji: '🔴',
  },
  // Add more games here in the future
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Text style={styles.title}>🎮 Game Hub</Text>
        <Text style={styles.subtitle}>Choose a game to play</Text>
      </View>

      <FlatList
        data={GAMES}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.gameCard}
            onPress={() => router.push(item.route)}
            activeOpacity={0.7}
          >
            <View style={styles.cardContent}>
              <Text style={styles.emoji}>{item.emoji}</Text>
              <View style={styles.textContainer}>
                <Text style={styles.gameTitle}>{item.title}</Text>
                <Text style={styles.gameDescription}>{item.description}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 24,
    paddingTop: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  gameCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  emoji: {
    fontSize: 48,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  gameDescription: {
    fontSize: 14,
    color: '#666',
  },
});
