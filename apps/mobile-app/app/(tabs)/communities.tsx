import { View, Text, FlatList, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CommunitiesScreen() {
  const communities = [
    {
      id: '1',
      name: 'Tech Enthusiasts',
      description: 'Discuss latest tech trends',
      members: 1234,
      isPrivate: false,
    },
    {
      id: '2',
      name: 'Photography Club',
      description: 'Share your best shots',
      members: 567,
      isPrivate: true,
    },
    {
      id: '3',
      name: 'Gaming Zone',
      description: 'Connect with fellow gamers',
      members: 890,
      isPrivate: false,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Communities</Text>
      </View>

      <FlatList
        data={communities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.communityItem}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.communityInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.communityName}>{item.name}</Text>
                {item.isPrivate && (
                  <View style={styles.privateBadge}>
                    <Text style={styles.privateText}>🔒</Text>
                  </View>
                )}
              </View>
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
              <Text style={styles.members}>
                {item.members.toLocaleString()} members
              </Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  communityItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  communityInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  communityName: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  privateBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  privateText: {
    fontSize: 12,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  members: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
