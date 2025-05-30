import React, { useEffect } from 'react';
import './List.css';
import tick from '../List/tick.svg';
import clock from '../List/clock.svg';
import updown from '../List/updown.svg';

export default function List() {
    let n = parseInt(localStorage.getItem('count')) || 0;

    useEffect(() => {
        loadData();
        toggleRead();
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    function toggleRead(){
        let f = document.querySelectorAll('.ttt')
        f.forEach(function(k){
            k.addEventListener('change',()=>{
            if(k.readOnly){
                k.classList.add('visible');
            }
            else{
                k.classList.remove('visible');
            }
        })
        });
        
    }

    function loadData() {
        const list = document.querySelector('.tasks_list');
        list.innerHTML = ''; // Clear existing tasks

        // 🗃️ Loop through tasks in localStorage
        for (let i = 0; i < n; i++) {
            let text = localStorage.getItem(i);
            if (text) {
                // ⏰ Check for reminder
                const reminderTime = localStorage.getItem(`reminder_${i}`);
                if (reminderTime) {
                    // 🕒 Compare reminder time with current time
                    const now = new Date();
                    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

                    const [currHours, currMinutes] = currentTime.split(':').map(Number);
                    const [remHours, remMinutes] = reminderTime.split(':').map(Number);
                    const isExpired = (currHours > remHours) || (currHours === remHours && currMinutes > remMinutes);
                    console.log(`Task ${i}: Current ${currentTime}, Reminder ${reminderTime}, Expired: ${isExpired}`);
                    if (currentTime > reminderTime) {
                        // 🗑️ Remove expired reminder
                        localStorage.removeItem(`reminder_${i}`);
                        alert(`Reminder for task "${text}" at ${reminderTime} has expired and was cleared!`);
                        // ✅ Still load the task (without reminder)
                        createTaskElement(text, i);
                    } else {
                        // ✅ Load task with active reminder
                        createTaskElement(text, i);
                    }
                } else {
                    // ✅ Load task without reminder
                    
                    createTaskElement(text, i);
                }
            }
        }
    }

    function createTaskElement(text, id) {
    const list = document.querySelector('.tasks_list');

    const taskAdd = document.createElement('input');
    taskAdd.type = 'checkbox';
    taskAdd.id = `check${id}`;
    taskAdd.classList.add('checking');

    const task = document.createElement('input');
    task.type = 'text';
    task.classList.add(taskAdd.id, 'ttt', 'full');
    task.value = text;
    task.readOnly = true;

    const lii = document.createElement('li');
        lii.classList.add('final_child');
        lii.appendChild(taskAdd);
        lii.appendChild(task);

        taskAdd.addEventListener('change', () => {
            lii.style.textDecoration = 'line-through';
            setTimeout(() => {
                lii.remove();
                localStorage.removeItem(id); // Remove task
                localStorage.removeItem(`reminder_${id}`); // Remove reminder
            }, 500);
        });

        task.addEventListener('dblclick', () => {
            task.readOnly = false;
            task.focus(); // Bring cursor in directly

            const saveOnEnter = (e) => {
                if (e.key === 'Enter') {
                    task.readOnly = true;
                    localStorage.setItem(id, task.value); // Save updated task
                    task.removeEventListener('keydown', saveOnEnter); // Clean up
                }
            };

            task.addEventListener('keydown', saveOnEnter);
        });

        let tick_img = document.createElement('img');
        tick_img.src = tick;
        tick_img.classList.add('task-icon');

        let clock_img = document.createElement('img');
        clock_img.src = clock;
        clock_img.classList.add('clock-icon', 'task-icon');
        clock_img.style.cursor = 'pointer';

        let updown_img = document.createElement('img');
        updown_img.src = updown;
        updown_img.classList.add('task-icon');

        tick_img.addEventListener('click', () => {
            task.readOnly = false;
            task.focus(); // So user can immediately start editing

            const handleKey = (e) => {
                if (e.key === 'Enter') {
                    task.readOnly = true;
                    localStorage.setItem(id, task.value); // Save updated task
                    task.removeEventListener('keydown', handleKey); // Clean up
                }
            };

            task.addEventListener('keydown', handleKey);
        });

        // 🕒 Load existing reminder if any
        const savedReminder = localStorage.getItem(`reminder_${id}`);
        if (savedReminder) {
            task.classList.add('locked'); // Mark as locked
            const reminderText = document.createElement('span');
            reminderText.innerText = `Reminder: ${savedReminder}`;
            reminderText.classList.add('reminder-text');
            reminderText.style.marginLeft = '10px';
            reminderText.style.fontSize = '12px';
            reminderText.style.color = 'purple'; // Nykaa vibe
            lii.appendChild(reminderText);
            // Hide SVGs if reminder is active
            tick_img.style.display = 'none';
            updown_img.style.display = 'none';
            clock_img.style.display = 'none';
            // ⏰ Check for alarm
            const timer = setInterval(() => {
                const now = new Date();
                const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                if (currentTime === savedReminder) {
                    clearInterval(timer);
                    alert(`⏰ Reminder for task: "${task.value}"`);
                    task.classList.remove('locked');
                    reminderText.remove();
                    localStorage.removeItem(`reminder_${id}`); // Clear reminder
                    // Show SVGs again
                    tick_img.style.display = 'inline';
                    updown_img.style.display = 'inline';
                    clock_img.style.display = 'inline';
                    lii.classList.remove('hover-locked');
                }
            }, 1000);
        }

        // 🕒 Clock icon click to set an alarm
        clock_img.addEventListener('click', () => {
            // ⛔ Prevent multiple alarms or inputs
            if (lii.querySelector('.timeInput') || task.classList.contains('locked')) {
                return; // Stop if alarm is active or input exists
            }

            // 1️⃣ Hide SVGs for THIS task
            tick_img.style.display = 'none';
            updown_img.style.display = 'none';
            clock_img.style.display = 'none';

            // 2️⃣ 🔒 Lock hover effects
            lii.classList.add('hover-locked'); // Disable hover via CSS

            // 3️⃣ Create time input for alarm
            const timeInput = document.createElement('input');
            timeInput.type = 'time';
            timeInput.className = 'timeInput';
            timeInput.style.marginLeft = '10px';
            timeInput.style.padding = '2px';
            timeInput.style.border = '1px solid gray';
            timeInput.style.borderRadius = '5px';

            // 4️⃣ Create "Set Alarm" button
            const setBtn = document.createElement('button');
            setBtn.innerText = 'Set Alarm';
            setBtn.style.marginLeft = '8px';
            setBtn.style.padding = '2px 6px';
            setBtn.style.cursor = 'pointer';
            setBtn.style.borderRadius = '5px';
            setBtn.style.border = 'none';
            setBtn.style.backgroundColor = 'purple'; // Nykaa vibe
            setBtn.style.color = 'white';
            setBtn.style.fontSize = '12px';

            // 5️⃣ Create "Cancel" button (✖)
            const cancelBtn = document.createElement('button');
            cancelBtn.innerText = '✖';
            cancelBtn.style.marginLeft = '8px';
            cancelBtn.style.padding = '2px 6px';
            cancelBtn.style.cursor = 'pointer';
            cancelBtn.style.borderRadius = '5px';
            cancelBtn.style.border = 'none';
            cancelBtn.style.backgroundColor = '#E80071'; // Nykaa pink
            cancelBtn.style.color = 'white';
            cancelBtn.style.fontSize = '12px';

            // 6️⃣ Add input and buttons to task
            lii.appendChild(timeInput);
            lii.appendChild(setBtn);
            lii.appendChild(cancelBtn);
            timeInput.focus();

            // 7️⃣ Handle "Set Alarm" button
            setBtn.addEventListener('click', () => {
                const userTime = timeInput.value;
                if (!userTime) {
                    alert('Please select a time!'); // Warn if no time
                    return;
                }

                // 🔒 Mark task as locked (alarm active)
                task.classList.add('locked');

                // 💾 Save reminder to localStorage
                localStorage.setItem(`reminder_${id}`, userTime);

                // ⏰ Show reminder time instead of SVGs
                const reminderText = document.createElement('span');
                reminderText.innerText = `Reminder: ${userTime}`;
                reminderText.classList.add('reminder-text');
                reminderText.style.marginLeft = '10px';
                reminderText.style.fontSize = '12px';
                reminderText.style.color = 'purple'; // Nykaa vibe
                lii.appendChild(reminderText);

                // ⏰ Start checking time for alarm
                const timer = setInterval(() => {
                    const now = new Date();
                    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                    if (currentTime === userTime) {
                        clearInterval(timer); // Stop checking
                        alert(`⏰ Reminder for task: "${task.value}"`);
                        task.classList.remove('locked'); // Unlock task
                        reminderText.remove(); // Remove reminder text
                        localStorage.removeItem(`reminder_${id}`); // Clear reminder
                        // ✅ Show SVGs again
                        tick_img.style.display = 'inline';
                        updown_img.style.display = 'inline';
                        clock_img.style.display = 'inline';
                        lii.classList.remove('hover-locked'); // Restore hover
                    }
                }, 1000);

                // 🧹 Clean up input and buttons
                timeInput.remove();
                setBtn.remove();
                cancelBtn.remove();
            });

            // 8️⃣ Handle "Cancel" button
            cancelBtn.addEventListener('click', () => {
                // 🧹 Remove input and buttons
                timeInput.remove();
                setBtn.remove();
                cancelBtn.remove();
                // ✅ Restore SVGs and hover
                tick_img.style.display = 'inline';
                updown_img.style.display = 'inline';
                clock_img.style.display = 'inline';
                lii.classList.remove('hover-locked');
            });
        });

        lii.appendChild(tick_img);
        lii.appendChild(clock_img);
        lii.appendChild(updown_img);
        list.appendChild(lii);
    }

    function addTask() {
        const inp = document.getElementById('inputOfTask');
        if (inp.value.trim() !== '') {
            localStorage.setItem(n, inp.value);
            createTaskElement(inp.value, n);
            n++;
            localStorage.setItem('count', n); // Save updated count
            inp.value = '';
        }
    }

    function delTasks(){
        const dec = window.confirm("Are you sure you want to clear your tasks list ?");
        if(dec){
            localStorage.clear();
            loadData();
            n=0;
        }
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            addTask();
        }
    };

    return (
        <>
            <div className="headOfBox">
                &lt;MG&gt;TO-DO LIST
            </div>
            <div className="box">
                <div className="tasks">
                    <ul className="tasks_list"></ul>
                </div>
            </div>
            <div className="footOfBox">
                <div className="inp">
                    <input type="text" id='inputOfTask' />
                </div>
                <div className="plus" onClick={addTask}>+</div>
                <div className="bin" onClick={delTasks} >🗑</div>
            </div>
        </> 
    );
}
