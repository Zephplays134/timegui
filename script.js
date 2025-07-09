function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;
    document.getElementById('clock').textContent = timeString;

    checkAlarms(hours, minutes, seconds);
}

let activeAlarms = [];
let alarmSound = new Audio('alarm.mp3'); // Placeholder for alarm sound - will need an actual file or a web audio beep.
let triggeredAlarmId = null;

const alarmHourInput = document.getElementById('alarmHour');
const alarmMinuteInput = document.getElementById('alarmMinute');
const setAlarmButton = document.getElementById('setAlarmButton');
const activeAlarmsList = document.getElementById('activeAlarmsList');
const alarmNotification = document.getElementById('alarmNotification');
const dismissAlarmButton = document.getElementById('dismissAlarmButton');

function displayAlarms() {
    activeAlarmsList.innerHTML = ''; // Clear existing list
    activeAlarms.forEach(alarm => {
        const listItem = document.createElement('li');
        listItem.textContent = `${String(alarm.hour).padStart(2, '0')}:${String(alarm.minute).padStart(2, '0')}`;
        
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-alarm-btn');
        deleteButton.onclick = () => removeAlarm(alarm.id);
        
        listItem.appendChild(deleteButton);
        activeAlarmsList.appendChild(listItem);
    });
}

function addAlarm() {
    const hour = parseInt(alarmHourInput.value);
    const minute = parseInt(alarmMinuteInput.value);

    if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        alert('Please enter a valid hour (0-23) and minute (0-59).');
        return;
    }

    const newAlarm = {
        id: Date.now(), // Unique ID for the alarm
        hour: hour,
        minute: minute,
        triggered: false
    };

    activeAlarms.push(newAlarm);
    activeAlarms.sort((a, b) => { // Sort alarms for display
        if (a.hour === b.hour) return a.minute - b.minute;
        return a.hour - b.hour;
    });
    displayAlarms();
    alarmHourInput.value = '';
    alarmMinuteInput.value = '';
}

function removeAlarm(alarmId) {
    activeAlarms = activeAlarms.filter(alarm => alarm.id !== alarmId);
    displayAlarms();
    // If the removed alarm was the one currently ringing, hide notification
    if (triggeredAlarmId === alarmId) {
        alarmNotification.classList.add('hidden');
        alarmSound.pause();
        alarmSound.currentTime = 0;
        triggeredAlarmId = null;
    }
}

function checkAlarms(currentHours, currentMinutes, currentSeconds) {
    if (currentSeconds !== 0) return; // Check only at the start of a minute for simplicity

    activeAlarms.forEach(alarm => {
        if (alarm.hour === parseInt(currentHours) && alarm.minute === parseInt(currentMinutes) && !alarm.triggered) {
            triggerAlarm(alarm);
        }
    });
}

function triggerAlarm(alarm) {
    console.log(`Alarm ringing: ${alarm.hour}:${alarm.minute}`);
    alarm.triggered = true; // Mark as triggered to avoid re-triggering (though it will be dismissed or deleted)
    triggeredAlarmId = alarm.id;
    alarmNotification.classList.remove('hidden');
    
    // Attempt to play sound - browser might block this if no prior user interaction
    alarmSound.play().catch(e => console.warn("Audio playback failed. User interaction might be needed.", e));
    
    // For now, alarm stays triggered until dismissed.
    // We could auto-dismiss after a while or make it re-trigger if not dismissed.
}

function dismissAlarm() {
    alarmNotification.classList.add('hidden');
    alarmSound.pause();
    alarmSound.currentTime = 0;
    if (triggeredAlarmId) {
        // Find the alarm that was triggered and mark it as no longer active or remove it
        const alarm = activeAlarms.find(a => a.id === triggeredAlarmId);
        if (alarm) {
            // Option 1: Remove the alarm after it's dismissed
            removeAlarm(triggeredAlarmId); 
            // Option 2: Or, if you want alarms to persist and re-trigger next day, reset its 'triggered' state
            // alarm.triggered = false; // And then don't call removeAlarm.
            // For this implementation, we'll remove it.
        }
        triggeredAlarmId = null;
    }
    displayAlarms(); // Refresh list in case it was removed
}

setAlarmButton.addEventListener('click', addAlarm);
dismissAlarmButton.addEventListener('click', dismissAlarm);

// Update the clock every second
setInterval(updateClock, 1000);

// Initial call to display clock immediately
updateClock();
displayAlarms(); // Display any initially (e.g. loaded from storage in future)
