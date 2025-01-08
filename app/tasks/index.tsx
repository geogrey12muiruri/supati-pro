import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  Button,
  Image,
  StatusBar,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import useSchedule from '../../hooks/useSchedule';
import useAppointments from '../../hooks/useAppointments';
import moment from 'moment';
import Colors from '../../components/Shared/Colors';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Task {
  id: string;
  description: string;
  time: string;
}

const TaskScreen: React.FC = () => {
  const router = useRouter();
  const { schedule, fetchSchedule, loading, error } = useSchedule();
  const { appointments, loading: appointmentsLoading, error: appointmentsError } = useAppointments();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [newTask, setNewTask] = useState<string>('');
  const [startTime, setStartTime] = useState<Date | undefined>(undefined);
  const [endTime, setEndTime] = useState<Date | undefined>(undefined);
  const [showStartTimePicker, setShowStartTimePicker] = useState<boolean>(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState<boolean>(false);

  useEffect(() => {
    const requestPermissions = async () => {
      if (Device.isDevice) {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          alert('Failed to get push token for notifications!');
        }
      } else {
        alert('Must use physical device for notifications');
      }
    };
    requestPermissions();
  }, []);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem('tasks');
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
        }
      } catch (e) {
        console.error('Failed to load tasks from storage', e);
      }
    };

    loadTasks();
  }, []);

  useEffect(() => {
    if (Array.isArray(appointments)) {
      const currentTime = moment();

      const filteredAppointments = appointments.filter((app) =>
        moment(`${app.date} ${app.time}`, 'YYYY-MM-DD HH:mm').isAfter(currentTime)
      );

      const transformedTasks = filteredAppointments.map((app) => ({
        id: app._id,
        description: `Meet with ${app.patientId.name}`,
        time: app.time,
      }));

      setTasks(transformedTasks);
    }
  }, [appointments]);

  useEffect(() => {
    const removeExpiredTasks = async () => {
      const currentTime = moment();
      const updatedTasks = tasks.filter(task => {
        const endTime = moment(task.time.split(' - ')[1], 'HH:mm');
        return endTime.isAfter(currentTime);
      });
      setTasks(updatedTasks);
      await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
    };

    const interval = setInterval(removeExpiredTasks, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [tasks]);

  const scheduleNotification = async (task: Task) => {
    const taskTime = moment(task.time.split(' - ')[0], 'HH:mm');
    const now = moment();

    if (taskTime.isAfter(now)) {
      const trigger = taskTime.diff(now, 'seconds');
      const reminderTrigger = taskTime.subtract(10, 'minutes').diff(now, 'seconds');

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Task Reminder',
          body: task.description,
        },
        trigger: { seconds: trigger },
      });

      if (reminderTrigger > 0) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Upcoming Task Reminder',
            body: `Your task "${task.description}" is coming up in 10 minutes.`,
          },
          trigger: { seconds: reminderTrigger },
        });
      }
    }
  };

  const addTask = async () => {
    if (newTask.trim() && startTime && endTime) {
      const newTaskObj: Task = {
        id: Date.now().toString(),
        description: newTask.trim(),
        time: `${moment(startTime).format('HH:mm')} - ${moment(endTime).format('HH:mm')}`,
      };
      const updatedTasks = [...tasks, newTaskObj];
      setTasks(updatedTasks);
      await scheduleNotification(newTaskObj);
      setNewTask('');
      setStartTime(undefined);
      setEndTime(undefined);
      setModalVisible(false);
      try {
        await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
      } catch (e) {
        console.error('Failed to save task to storage', e);
      }
    }
  };

  const renderTaskItem = ({ item }: { item: Task }) => (
    <View style={styles.taskCard}>
      <View style={styles.taskCardContent}>
        <Text style={styles.taskTime}>{item.time}</Text>
        <Text style={styles.taskDescription}>{item.description}</Text>
      </View>
      <TouchableOpacity onPress={() => scheduleNotification(item)} style={styles.reminderIcon}>
        <Icon name="bell" size={24} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Icon name="arrow-left" size={24} color={Colors.primary} />
      </TouchableOpacity>
      <View style={styles.header}>
        <Image source={{ uri: 'https://via.placeholder.com/40' }} style={styles.profileImage} />
        <Text style={styles.title}>Your Tasks</Text>
        <TouchableOpacity onPress={() => {}} style={styles.bellIcon}>
          <Icon name="bell" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      {tasks.length > 0 ? (
        <>
          <Text style={styles.taskListHeader}>Upcoming Tasks</Text>
          <FlatList
            data={tasks}
            renderItem={renderTaskItem}
            keyExtractor={(item) => item.id}
          />
        </>
      ) : (
        <Text style={styles.noTasksText}>No upcoming tasks.</Text>
      )}
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
        <Text style={styles.addButtonText}>Add Task</Text>
      </TouchableOpacity>
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Task</Text>
            <TextInput
              placeholder="Enter task"
              value={newTask}
              onChangeText={setNewTask}
              style={styles.input}
            />
            <TouchableOpacity onPress={() => setShowStartTimePicker(true)} style={styles.input}>
              <Text>{startTime ? moment(startTime).format('HH:mm') : 'Start Time (HH:mm)'}</Text>
            </TouchableOpacity>
            {showStartTimePicker && (
              <DateTimePicker
                value={startTime || new Date()}
                mode="time"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowStartTimePicker(false);
                  if (selectedDate) {
                    setStartTime(selectedDate);
                  }
                }}
              />
            )}
            <TouchableOpacity onPress={() => setShowEndTimePicker(true)} style={styles.input}>
              <Text>{endTime ? moment(endTime).format('HH:mm') : 'End Time (HH:mm)'}</Text>
            </TouchableOpacity>
            {showEndTimePicker && (
              <DateTimePicker
                value={endTime || new Date()}
                mode="time"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowEndTimePicker(false);
                  if (selectedDate) {
                    setEndTime(selectedDate);
                  }
                }}
              />
            )}
            <Button title="Add Task" onPress={addTask} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} color="#888" />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f0f0f0' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingTop: StatusBar.currentHeight },
  profileImage: { width: 40, height: 40, borderRadius: 20 },
  bellIcon: { padding: 8 },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.primary },
  taskListHeader: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  taskCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2, marginBottom: 10 },
  taskCardContent: { flex: 1 },
  taskTime: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4 },
  taskDescription: { fontSize: 16, color: '#333' },
  reminderIcon: { padding: 8 },
  noTasksText: { fontSize: 16, color: '#777', textAlign: 'center', marginTop: 20 },
  addButton: { backgroundColor: Colors.primary, padding: 10, borderRadius: 5, justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: 20, right: 20 },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  backButton: { position: 'absolute', top: 40, left: 16, zIndex: 1 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { width: '80%', backgroundColor: '#fff', borderRadius: 10, padding: 20, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 10 },
});

export default TaskScreen;
