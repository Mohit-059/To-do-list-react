import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';
import clock from '../List/clock.svg'
import pencil from '../List/tick.svg'

export default function About() {
    return (
        <>
            {/* 📌 Header (Unchanged) */}
            <div className="headOfBox">
                <Link to="/" className="small_text">Home</Link>
                <span>{"<MG> TO-DO LIST"}</span>
                <Link to="/about" className="small_text">About</Link>
            </div>
            {/* 📌 About container */}
            <div className="about-box">
                <div className="about-content">
                    {/* 📌 Section 1: About the App */}
                    <h2>About the App</h2>
                    <p>
                        Welcome to <span className="highlight">&lt;MG&gt; To-Do List</span>, a sleek and intuitive task management app designed to help you stay organized and productive! This app was created as part of my internship project , with a focus on simplicity, functionality, and a touch of style and vibrant aesthetic. Whether you’re managing daily tasks or setting reminders, this app has got you covered with a beginner-friendly interface and powerful features.
                    </p>
                    <h3>Key Features</h3>
                    <ul>
                        <li><strong>Add Tasks:</strong> Easily add new tasks with a single click or by pressing Enter. Your tasks are saved to <code>localStorage</code>, so they persist even after a refresh.</li>

<li><strong>Edit Tasks:</strong> Double-click a task or click the edit icon (<img src={pencil} alt="edit icon" className="inline-icon" />) to modify it. Save changes with Enter or by clicking away.</li>

<li><strong>Set Reminders:</strong> Click the clock icon (<img src={clock} alt="clock icon" className="inline-icon" />) to set a reminder for a task. Reminders are stored in <code>localStorage</code> and persist across sessions. If a task is deleted, its reminder is automatically canceled to avoid unnecessary alerts.</li>

<li><strong>Mark as Done:</strong> Check the box next to a task to mark it as complete. The task is removed from the list, and remaining tasks shift up automatically.</li>

<li><strong>Drag-and-Drop:</strong> Reorder tasks effortlessly by dragging them to your preferred position. The updated order is saved instantly.</li>

<li><strong>Clear All:</strong> Use the bin icon (🗑️) to clear all tasks at once, with a confirmation prompt to prevent accidental deletions.</li>

<li><strong>Persistent Storage:</strong> All tasks, reminders, and their order are saved using <code>localStorage</code>, ensuring your data is retained across sessions.</li>

<li><strong>Styling:</strong> The app features a playful UI with a yellow background (<code>#fff5cc</code>), vibrant pink accents (<code>#E80071</code>), and bold purple highlights, delivering a cohesive and fun visual experience.</li>

                    </ul>

                    {/* 📌 Section 2: Meet the Developer */}
                    <h2 >Meet the Developer</h2>
                    <p>
                        Hi, I’m Mohit, the creator of this To-Do List app! I’m a passionate beginner developer interning , where I’m learning to build functional and user-friendly web applications. This project is a milestone in my coding journey, showcasing my skills in React, drag-and-drop functionality, and localStorage management. I aimed to create an app that’s both practical and visually appealing. Thanks for checking it out! Check out more of my work on <a href="https://github.comMohit-059" target="_blank" rel="noopener noreferrer">GitHub</a> or on <a href="www.linkedin.com/in/mohit-gogia-374b78318" target="_blank" rel="noopener noreferrer">LinkedIn</a>.
                    </p>
                </div>
            </div>
        <div className="footOfBox"></div>
        </>
    );
}