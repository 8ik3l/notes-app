import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const STORAGE_KEY = "@notes_app_notes";

export default function App() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [editor, setEditor] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  async function loadNotes() {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) setNotes(JSON.parse(saved));
    } catch {}
  }

  async function saveNotes(data) {
    setNotes(data);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  async function addNote() {
    if (!title.trim() && !body.trim()) {
      Alert.alert("ملاحظة", "اكتب عنوانًا أو محتوى أولاً");
      return;
    }

    const note = {
      id: Date.now().toString(),
      title: title.trim() || "بدون عنوان",
      body: body.trim(),
      date: new Date().toLocaleDateString("ar-IQ"),
    };

    await saveNotes([note, ...notes]);
    setTitle("");
    setBody("");
    setEditor(false);
  }

  async function deleteNote(id) {
    Alert.alert("حذف الملاحظة", "هل تريد حذف هذه الملاحظة؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          await saveNotes(notes.filter((n) => n.id !== id));
        },
      },
    ]);
  }

  const filtered = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.body.toLowerCase().includes(search.toLowerCase())
  );

  if (editor) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        <View style={styles.editorHeader}>
          <TouchableOpacity onPress={() => setEditor(false)}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>ملاحظة جديدة</Text>

          <TouchableOpacity onPress={addNote}>
            <Text style={styles.saveText}>حفظ</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.titleInput}
          placeholder="العنوان"
          placeholderTextColor="#777"
          value={title}
          onChangeText={setTitle}
          textAlign="right"
        />

        <TextInput
          style={styles.bodyInput}
          placeholder="اكتب ملاحظتك هنا..."
          placeholderTextColor="#666"
          value={body}
          onChangeText={setBody}
          multiline
          textAlign="right"
          textAlignVertical="top"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>ملاحظات</Text>
          <Text style={styles.subtitle}>
            {notes.length} ملاحظات
          </Text>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={() => setEditor(true)}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={21} color="#888" />

        <TextInput
          style={styles.searchInput}
          placeholder="ابحث في ملاحظاتك..."
          placeholderTextColor="#777"
          value={search}
          onChangeText={setSearch}
          textAlign="right"
        />
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="document-text-outline" size={64} color="#555" />
          <Text style={styles.emptyTitle}>لا توجد ملاحظات</Text>
          <Text style={styles.emptyText}>
            اضغط + لإنشاء أول ملاحظة
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.noteCard}>
              <View style={styles.noteContent}>
                <Text style={styles.noteTitle}>{item.title}</Text>

                {item.body ? (
                  <Text
                    style={styles.noteBody}
                    numberOfLines={3}
                  >
                    {item.body}
                  </Text>
                ) : null}

                <Text style={styles.noteDate}>{item.date}</Text>
              </View>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteNote(item.id)}
              >
                <Ionicons
                  name="trash-outline"
                  size={21}
                  color="#ff6b6b"
                />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0D",
  },

  header: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  appTitle: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
    textAlign: "right",
  },

  subtitle: {
    color: "#777",
    fontSize: 14,
    marginTop: 4,
    textAlign: "right",
  },

  addButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#C43B91",
    alignItems: "center",
    justifyContent: "center",
  },

  searchBox: {
    marginHorizontal: 20,
    height: 52,
    borderRadius: 17,
    backgroundColor: "#18181B",
    borderWidth: 1,
    borderColor: "#29292D",
    paddingHorizontal: 15,
    flexDirection: "row-reverse",
    alignItems: "center",
  },

  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    marginHorizontal: 10,
  },

  list: {
    padding: 20,
    paddingBottom: 40,
  },

  noteCard: {
    backgroundColor: "#171719",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#29292D",
    padding: 18,
    marginBottom: 14,
    flexDirection: "row-reverse",
    alignItems: "flex-start",
  },

  noteContent: {
    flex: 1,
  },

  noteTitle: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "700",
    textAlign: "right",
  },

  noteBody: {
    color: "#AAA",
    fontSize: 15,
    lineHeight: 23,
    marginTop: 8,
    textAlign: "right",
  },

  noteDate: {
    color: "#666",
    fontSize: 12,
    marginTop: 12,
    textAlign: "right",
  },

  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 100,
  },

  emptyTitle: {
    color: "#fff",
    fontSize: 21,
    fontWeight: "700",
    marginTop: 16,
  },

  emptyText: {
    color: "#777",
    fontSize: 15,
    marginTop: 7,
  },

  editorHeader: {
    height: 65,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTitle: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "700",
  },

  saveText: {
    color: "#C43B91",
    fontSize: 17,
    fontWeight: "700",
  },

  titleInput: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
    paddingHorizontal: 22,
    paddingVertical: 18,
  },

  bodyInput: {
    flex: 1,
    color: "#ddd",
    fontSize: 17,
    lineHeight: 27,
    paddingHorizontal: 22,
    paddingTop: 5,
  },
});
