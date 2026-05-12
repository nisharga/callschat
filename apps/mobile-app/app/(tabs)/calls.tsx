import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function CallsScreen() {
  const calls = [
    { id: '1', name: 'John Doe', type: 'incoming', time: '10:30 AM', duration: '5 min' },
    { id: '2', name: 'Jane Smith', type: 'outgoing', time: 'Yesterday', duration: '15 min' },
    { id: '3', name: 'Family Group', type: 'missed', time: '2 days ago', duration: '' },
  ];

  const getIconName = (type: string) => {
    switch (type) {
      case 'incoming': return 'call-outline';
      case 'outgoing': return 'call-outline';
      case 'missed': return 'call-missed';
      default: return 'call-outline';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'incoming': return '#10b981';
      case 'outgoing': return '#0ea5e9';
      case 'missed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calls</Text>
        <TouchableOpacity style={styles.newCallButton}>
          <Ionicons name="call" size={24} color="#0ea5e9" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {calls.map((call) => (
          <View key={call.id} style={styles.callItem}>
            <View style={styles.avatar}>
              <Ionicons
                name={getIconName(call.type) as any}
                size={24}
                color={getIconColor(call.type)}
              />
            </View>
            <View style={styles.callInfo}>
              <Text style={styles.callName}>{call.name}</Text>
              <Text style={styles.callDetails}>
                {call.type} • {call.time}
                {call.duration && ` • ${call.duration}`}
              </Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="call" size={24} color="#0ea5e9" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  newCallButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  callItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  callInfo: {
    flex: 1,
  },
  callName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  callDetails: {
    fontSize: 14,
    color: '#6b7280',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
