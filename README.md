Project Title: SpendWise – A Minimalist Daily Expense Tracker

Project Description:
SpendWise is a lightweight React Native application designed for individual budget
management. The app allows users to record their daily expenses locally on their mobile device
without the need for an external server or complex login system.By utilizing AsyncStorage, the
app provides a persistent experience where users can add, view, edit, and delete their financial
records (CRUD). The interface is built using a "Clean UI" philosophy, focusing on high readability
and quick data entry, making it an ideal tool for students or individuals looking to monitor their
spending habits on the go.

System Flow:
1. Initialization Phase:
- The user launches the app. The system triggers a request to AsyncStorage. If data exists, it
populates the global state; otherwise, it displays an empty state.
2. Input & Create (C):
- User interacts with an 'Add' button. A form collects Title, Amount, and Category. On
submission, the app assigns a unique ID, updates the state, and persists the new data to local
storage.
3. Display & Read (R):
- The app uses a FlatList to monitor the state. It automatically renders the list of expenses and
calculates a real-time total sum at the top of the interface.
4. Modification & Update (U):
- User selects an item to edit. The app populates a form with existing data. Upon saving, the app
identifies the record by its unique ID, replaces the data in the state, and updates storage.
5. Removal & Delete (D):
- User selects a delete option for a specific entry. After confirmation, the item is filtered out of
the array, and the updated list is re-saved to local storage.
