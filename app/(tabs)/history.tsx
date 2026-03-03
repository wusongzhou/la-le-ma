import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, Alert, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { initDatabase, getAllRecords, deleteRecord, PoopRecord } from '@/db';
import { Typography, Colors } from '@/components/ui';
import dayjs from 'dayjs';

export default function HistoryScreen() {
  const [records, setRecords] = useState<PoopRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRecords = useCallback(async () => {
    try {
      const data = await getAllRecords(100);
      setRecords(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await initDatabase();
      await loadRecords();
    };
    init();
  }, [loadRecords]);

  useEffect(() => {
    const unsubscribe = setInterval(loadRecords, 5000);
    return () => clearInterval(unsubscribe);
  }, [loadRecords]);

  const formatDuration = (seconds: number | null): string => {
    if (seconds === null) return '进行中...';
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}分${sec}秒`;
  };

  const handleDelete = (record: PoopRecord) => {
    Alert.alert('删除记录', '确定要删除这条记录吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          await deleteRecord(record.id);
          await loadRecords();
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: PoopRecord }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onLongPress={() => handleDelete(item)}
      activeOpacity={0.8}
    >
      <BlurView intensity={20} tint="light" style={styles.itemBlur}>
        <View style={styles.itemContent}>
          <View style={styles.itemLeft}>
            <Typography variant="h3">{dayjs(item.start_time).format('MM月DD日 HH:mm')}</Typography>
            <Typography variant="caption" style={styles.note}>
              {item.note || '无备注'}
            </Typography>
          </View>
          <View style={styles.itemRight}>
            <Text style={styles.duration}>{formatDuration(item.duration_seconds)}</Text>
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <BlurView intensity={80} style={StyleSheet.absoluteFill} />
        <Typography>加载中...</Typography>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BlurView intensity={80} style={StyleSheet.absoluteFill} />
      <FlatList
        data={records}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🚽</Text>
            <Typography variant="body" style={styles.emptyText}>
              暂无记录
            </Typography>
            <Typography variant="caption">去首页开始第一次记录吧</Typography>
          </View>
        }
        contentContainerStyle={styles.list}
        onRefresh={loadRecords}
        refreshing={isLoading}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4ff',
  },
  list: {
    padding: 20,
    paddingTop: 60,
  },
  itemContainer: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  itemBlur: {
    flex: 1,
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  itemLeft: {
    flex: 1,
  },
  note: {
    marginTop: 4,
  },
  itemRight: {
    marginLeft: 12,
  },
  duration: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.success,
  },
  empty: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    marginBottom: 8,
  },
});
