import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { FlatList, Swipeable } from 'react-native-gesture-handler';
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

  const handleDelete = async (id: number) => {
    await deleteRecord(id);
    await loadRecords();
  };

  const renderRightActions = (id: number, close: any) => (
    <TouchableOpacity
      style={styles.deleteAction}
      onPress={() => {
        close();
        setTimeout(() => handleDelete(id), 200);
      }}
    >
      <Text style={styles.deleteText}>删除</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item, index }: { item: PoopRecord; index: number }) => {
    const cardColors = [Colors.yellow, Colors.orange, Colors.pink];
    const bgColor = cardColors[index % 3];

    return (
      <Swipeable
        renderRightActions={(progress, dragX, close) => renderRightActions(item.id, close)}
        rightThreshold={40}
        overshootRight={false}
        activeOffsetX={[-20, 20]}
        failOffsetY={[-10, 10]}
        containerStyle={{ backgroundColor: Colors.background }}
      >
        <View style={[styles.itemCard, { backgroundColor: bgColor }]}>
          <View style={styles.itemContent}>
            <View style={styles.itemLeft}>
              <Typography variant="h3">{dayjs(item.start_time).format('MM月DD日 HH:mm')}</Typography>
            </View>
            <View style={styles.durationBadge}>
              <Text style={styles.duration}>{formatDuration(item.duration_seconds)}</Text>
            </View>
          </View>
        </View>
      </Swipeable>
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
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
  separator: {
    height: 8,
  },
  itemCard: {
    borderRadius: 0,
    borderWidth: 3,
    borderColor: Colors.sketch.dark,
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
  },
  itemLeft: {
    flex: 1,
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
  deleteAction: {
    backgroundColor: Colors.magenta,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  deleteText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
