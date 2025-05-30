import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom'; //   Navigation
import './List.css'; //   Nykaa-inspired styles
import tick from './tick.svg'; //   Edit icon
import clock from './clock.svg'; //   Reminder icon
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'; //   Drag-and-drop
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'; //   Sorting
import { CSS } from '@dnd-kit/utilities'; //   Drag animations

export default function List() {
    //   Task count from localStorage
    let n = parseInt(localStorage.getItem('count')) || 0;

    //   State for tasks (id, text, reminder, completed)
    const [tasks, setTasks] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0); //   Force re-render if needed

    //   Sensors for dragging
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // 🖱️ Mouse drag
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }) // ⌨️ Keyboard drag
    );

    //   Load tasks and set up listeners
    useEffect(() => {
        loadData(); // 🗃️ Load tasks
        window.addEventListener('keydown', handleKeyDown); // 🎹 Enter key
        return () => window.removeEventListener('keydown', handleKeyDown); // 🧹 Cleanup
    }, [refreshKey]);

    //   Load tasks from localStorage
    function loadData() {
        const loadedTasks = [];
        let validCount = 0; //   Count non-deleted tasks
        for (let i = 0; i < n; i++) {
            const text = localStorage.getItem(`task_${i}`);
            const completed = localStorage.getItem(`completed_${i}`) === 'true';
            if (text && !completed) { //   Only load non-completed tasks
                const reminderTime = localStorage.getItem(`reminder_${i}`);
                if (reminderTime) {
                    const now = new Date();
                    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                    const [currHours, currMinutes] = currentTime.split(':').map(Number);
                    const [remHours, remMinutes] = reminderTime.split(':').map(Number);
                    const isExpired = (currHours > remHours) || (currHours === remHours && currMinutes >= remMinutes);
                    if (isExpired) {
                        localStorage.removeItem(`reminder_${i}`);
                        alert(`Reminder for task "${text}" at ${reminderTime} has expired and was cleared!`);
                        loadedTasks.push({ id: validCount, text, reminder: null, completed: false });
                    } else {
                        loadedTasks.push({ id: validCount, text, reminder: reminderTime, completed: false });
                    }
                } else {
                    loadedTasks.push({ id: validCount, text, reminder: null, completed: false });
                }
                validCount++;
            }
        }
        //   Update localStorage with reindexed tasks
        for (let i = 0; i < validCount; i++) {
            localStorage.setItem(`task_${i}`, loadedTasks[i].text);
            localStorage.setItem(`completed_${i}`, loadedTasks[i].completed);
            if (loadedTasks[i].reminder) {
                localStorage.setItem(`reminder_${i}`, loadedTasks[i].reminder);
            } else {
                localStorage.removeItem(`reminder_${i}`);
            }
        }
        //   Clear any extra keys
        for (let i = validCount; i < n; i++) {
            localStorage.removeItem(`task_${i}`);
            localStorage.removeItem(`completed_${i}`);
            localStorage.removeItem(`reminder_${i}`);
        }
        localStorage.setItem('count', validCount);
        n = validCount;
        setTasks(loadedTasks);
    }

    //   Handle drag-and-drop
    function handleDragEnd(event) {
        const { active, over } = event;
        if (active.id !== over.id) {
            setTasks((prevTasks) => {
                const oldIndex = prevTasks.findIndex((task) => task.id === active.id);
                const newIndex = prevTasks.findIndex((task) => task.id === over.id);
                const reorderedTasks = arrayMove(prevTasks, oldIndex, newIndex);
                for (let i = 0; i < reorderedTasks.length; i++) {
                    localStorage.setItem(`task_${i}`, reorderedTasks[i].text);
                    localStorage.setItem(`completed_${i}`, reorderedTasks[i].completed);
                    if (reorderedTasks[i].reminder) {
                        localStorage.setItem(`reminder_${i}`, reorderedTasks[i].reminder);
                    } else {
                        localStorage.removeItem(`reminder_${i}`);
                    }
                }
                localStorage.setItem('count', reorderedTasks.length);
                n = reorderedTasks.length;
                return reorderedTasks;
            });
        }
    }

    //   Draggable task component
    function SortableTask({ task }) {
        const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
        const style = {
            transform: CSS.Transform.toString(transform),
            transition,
            opacity: isDragging ? 0.9 : 1, //   Only apply opacity during drag
        };

        //   State for editing
        const [editText, setEditText] = useState(task.text);
        const [isEditing, setIsEditing] = useState(false);
        const inputRef = useRef(null); //   Ref for input focus

        //   Start editing
        const startEditing = () => {
            if (!task.reminder) {
                setIsEditing(true);
                inputRef.current?.focus(); //   Focus input
            }
        };

        //   Save edit
        const saveEdit = () => {
            if (editText.trim() !== '') {
                localStorage.setItem(`task_${task.id}`, editText);
                setTasks((prevTasks) =>
                    prevTasks.map((t) =>
                        t.id === task.id ? { ...t, text: editText } : t
                    )
                );
                setIsEditing(false);
            } else {
                alert('Task cannot be empty!');
            }
        };

        //   Cancel edit
        const cancelEdit = () => {
            setEditText(task.text);
            setIsEditing(false);
        };

        //   Remove task when marked done
        const handleCheckboxChange = () => {
            //   Mark as completed in localStorage
            localStorage.setItem(`completed_${task.id}`, true);
            //   Filter out the completed task
            setTasks((prevTasks) => {
                const updatedTasks = prevTasks
                    .filter((t) => t.id !== task.id) //   Remove this task
                    .map((t, index) => ({ ...t, id: index })); //   Reindex remaining tasks
                //   Update localStorage with reindexed tasks
                for (let i = 0; i < updatedTasks.length; i++) {
                    localStorage.setItem(`task_${i}`, updatedTasks[i].text);
                    localStorage.setItem(`completed_${i}`, updatedTasks[i].completed);
                    if (updatedTasks[i].reminder) {
                        localStorage.setItem(`reminder_${i}`, updatedTasks[i].reminder);
                    } else {
                        localStorage.removeItem(`reminder_${i}`);
                    }
                }
                //   Clear extra keys
                for (let i = updatedTasks.length; i < n; i++) {
                    localStorage.removeItem(`task_${i}`);
                    localStorage.removeItem(`completed_${i}`);
                    localStorage.removeItem(`reminder_${i}`);
                }
                localStorage.setItem('count', updatedTasks.length);
                n = updatedTasks.length;
                return updatedTasks;
            });
        };

        //   Set reminder
        const handleSetReminder = (li, taskId) => {
            if (li.querySelector('.timeInput') || li.querySelector('.locked')) return;
            li.querySelectorAll('.task-icon').forEach((img) => (img.style.display = 'none'));
            li.classList.add('hover-locked');
            const timeInput = document.createElement('input');
            timeInput.type = 'time';
            timeInput.className = 'timeInput';
            timeInput.style.marginLeft = '10px';
            timeInput.style.padding = '2px';
            timeInput.style.border = '1px solid gray';
            timeInput.style.borderRadius = '5px';
            const setBtn = document.createElement('button');
            setBtn.innerText = 'Set Alarm';
            setBtn.style.marginLeft = '8px';
            setBtn.style.padding = '2px 6px';
            setBtn.style.cursor = 'pointer';
            setBtn.style.borderRadius = '5px';
            setBtn.style.border = 'none';
            setBtn.style.backgroundColor = 'purple';
            setBtn.style.color = 'white';
            setBtn.style.fontSize = '12px';
            const cancelBtn = document.createElement('button');
            cancelBtn.innerText = '✖';
            cancelBtn.style.marginLeft = '8px';
            cancelBtn.style.padding = '2px 6px';
            setBtn.style.cursor = 'pointer';
            setBtn.style.borderRadius = '5px';
            setBtn.style.border = 'none';
            cancelBtn.style.backgroundColor = '#E80071';
            cancelBtn.style.color = 'white';
            cancelBtn.style.fontSize = '12px';
            li.appendChild(timeInput);
            li.appendChild(setBtn);
            li.appendChild(cancelBtn);
            timeInput.focus();
            setBtn.addEventListener('click', () => {
                const userTime = timeInput.value;
                if (!userTime) {
                    alert('Please select a time!');
                    return;
                }
                const taskInput = li.querySelector('.ttt');
                taskInput.classList.add('locked');
                localStorage.setItem(`reminder_${taskId}`, userTime);
                setTasks((prevTasks) =>
                    prevTasks.map((t) =>
                        t.id === taskId ? { ...t, reminder: userTime } : t
                    )
                );
                const reminderText = document.createElement('span');
                reminderText.innerText = `Reminder: ${userTime}`;
                reminderText.className = 'reminder-text';
                reminderText.style.marginLeft = '10px';
                reminderText.style.fontSize = '12px';
                reminderText.style.color = 'purple';
                li.appendChild(reminderText);
                const timer = setInterval(() => {
                    const now = new Date();
                    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                    if (currentTime === userTime) {
                        clearInterval(timer);
                        //   Check if task still exists in localStorage
                        const taskText = localStorage.getItem(`task_${taskId}`);
                        if (taskText) {
                            alert(`⏰ Reminder for task: "${taskInput.value}"`);
                        }
                        taskInput.className = `ttt full ${isEditing ? 'editing' : ''}`; //   Reset className to remove 'locked'
                        reminderText.remove();
                        localStorage.removeItem(`reminder_${taskId}`);
                        setTasks((prevTasks) =>
                            prevTasks.map((t) =>
                                t.id === taskId ? { ...t, reminder: null } : t
                            )
                        );
                        li.querySelectorAll('.task-icon').forEach((img) => (img.style.display = 'inline-block'));
                        li.classList.remove('hover-locked');
                    }
                }, 1000);
                timeInput.remove();
                setBtn.remove();
                cancelBtn.remove();
            });
            cancelBtn.addEventListener('click', () => {
                timeInput.remove();
                setBtn.remove();
                cancelBtn.remove();
                li.querySelectorAll('.task-icon').forEach((img) => (img.style.display = 'inline-block'));
                li.classList.remove('hover-locked');
            });
        };

        return (
            <li
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                className="final_child"
            >
                {/*   Checkbox */}
                <input
                    type="checkbox"
                    id={`task-${task.id}`}
                    className="checking"
                    checked={task.completed}
                    onChange={handleCheckboxChange}
                />
                {/*   Task input */}
                <input
                    ref={inputRef} //   Ref for focus
                    type="text"
                    className={`ttt full ${task.reminder ? 'locked' : ''} ${isEditing ? 'editing' : ''}`}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    readOnly={!isEditing} //   Editable only when isEditing
                    onDoubleClick={startEditing}
                    onKeyDown={(e) => {
                        if (isEditing) {
                            if (e.key === 'Enter') saveEdit();
                            if (e.key === 'Escape') cancelEdit();
                        }
                    }}
                    onBlur={isEditing ? saveEdit : undefined}
                />
                {/*   Edit icon */}
                <img
                    src={tick}
                    className="task-icon"
                    alt="Edit task"
                    style={{ display: task.reminder || isEditing ? 'none' : 'inline-block' }}
                    onClick={startEditing}
                />
                {/*   Reminder icon */}
                <img
                    src={clock}
                    className="clock-icon task-icon"
                    alt="Set reminder"
                    style={{ display: task.reminder || isEditing ? 'none' : 'inline-block', cursor: 'pointer' }}
                    onClick={(e) => handleSetReminder(e.target.parentElement, task.id)}
                />
                {task.reminder && (
                    <span
                        className="reminder-text"
                        style={{ marginLeft: '10px', fontSize: '12px', color: 'purple' }}
                    >
                        Reminder: {task.reminder}
                    </span>
                )}
            </li>
        );
    }

    //   Add new task
    function addTask() {
        const inp = document.getElementById('inputOfTask');
        if (inp.value.trim() !== '') {
            const newTask = { id: n, text: inp.value, reminder: null, completed: false };
            localStorage.setItem(`task_${n}`, inp.value); // 💾 Save task
            localStorage.setItem(`completed_${n}`, false); //   Save completed status
            setTasks((prevTasks) => [...prevTasks, newTask]); // 🔄 Append to state
            n++;
            localStorage.setItem('count', n); //   Update count
            inp.value = ''; // 🧹 Clear input
        }
    }

    //   Clear all tasks
    function delTasks() {
        const dec = window.confirm("Are you sure you want to clear your tasks list?");
        if (dec) {
            //   Remove all task-related localStorage keys
            for (let i = 0; i <= n; i++) { //   Fixed loop to include n
                localStorage.removeItem(`task_${i}`);
                localStorage.removeItem(`completed_${i}`);
                localStorage.removeItem(`reminder_${i}`);
            }
            localStorage.setItem('count', 0); //   Reset count
            setTasks([]); //   Clear state
            n = 0; //   Reset counter
            setRefreshKey((prev) => prev + 1); //   Force re-render
        }
    }

    //   Add task on Enter
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            addTask();
        }
    };

    return (
        <>
            {/*   Header */}
            <div className="headOfBox">
                <Link to="/" className="small_text">Home</Link>
                <span>{"<MG> TO-DO LIST"}</span>
                <Link to="/about" className="small_text">About</Link>
            </div>
            {/*   Note container */}
            <div className="box">
                <div className="tasks">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
                            <ul className="tasks_list">
                                {tasks.map((task) => (
                                    <SortableTask key={task.id} task={task} />
                                ))}
                            </ul>
                        </SortableContext>
                    </DndContext>
                </div>
            </div>
            {/*   Footer */}
            <div className="footOfBox">
                <div className="inp">
                    <input type="text" id="inputOfTask" />
                </div>
                <div className="plus" onClick={addTask}>+</div>
                <div className="bin" onClick={delTasks}>🗑️</div>
            </div>
        </>
    );
}