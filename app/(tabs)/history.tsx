import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, Alert, Text, View } from 'react-native';
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

  const renderItem = ({ item, index }: { item: PoopRecord; index: number }) => {
    const cardColors = [Colors.mint, Colors.pink, Colors.sky];
    const bgColor = cardColors[index % 3];

    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onLongPress={() => handleDelete(item)}
        activeOpacity={0.85}
      >
        <View style={[styles.itemCard, { backgroundColor: bgColor }]}>
          <View style={styles.itemContent}>
            <View style={styles.itemLeft}>
              <Typography variant="h3">{dayjs(item.start_time).format('MM月DD日 HH:mm')}</Typography>
              <Typography variant="caption" style={styles.note}>
                {item.note || '无备注'}
              </Typography>
            </View>
            <View style={styles.durationBadge}>
              <Text style={styles.duration}>{formatDuration(item.duration_seconds)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Typography>加载中...</Typography>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Typography variant="h1">历史记录</Typography>
      </View>

      <FlatList
        data={records}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🚽</Text>
            <Typography variant="h2">暂无记录</Typography>
          </View>
        }
        contentContainerStyle={styles.list}
        onRefresh={loadRecords}
        refreshing={isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 60,
    padding: 20,
  },
  list: {
    padding: 20,
    paddingTop: 0,
  },
  itemContainer: {
    marginBottom: 16,
  },
  itemCard: {
    padding: 18,
    borderRadius: 16,
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLeft: {
    flex: 1,
  },
  note: {
    marginTop: 4,
  },
  durationBadge: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  duration: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  empty: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
});
