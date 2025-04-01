Real-Time Facial Emotion Detection
Project Overview
This project is a real-time facial emotion detection application using DeepFace, OpenCV, and Streamlit. It utilizes deep learning models to analyze faces and predict age, gender, emotions, and race in real-time through a webcam feed. The detected emotions are logged at 1-minute intervals, and the results can be downloaded as a CSV file for further analysis.

Dependencies and Installation
1. Required Dependencies
This project relies on the following key libraries:

DeepFace – A deep learning facial analysis library that provides pre-trained models for facial emotion detection, age estimation, gender classification, and race prediction.
OpenCV – An open-source computer vision library used for image and video processing.
Streamlit – A Python framework for creating interactive web applications with minimal coding.
NumPy – A fundamental package for scientific computing in Python.
Pandas – A data analysis and manipulation tool for handling logged emotion data.
2. Setting Up the Environment
Before running the application, follow these steps to install the necessary dependencies.

Step 1: Create a Virtual Environment (Recommended)
Creating a virtual environment helps in managing dependencies cleanly.

# For Windows
`python -m venv venv`
`venv\Scripts\activate`

# For macOS/Linux
`python3 -m venv venv`
`source venv/bin/activate`
Step 2: Install Required Packages
You can install the dependencies using the provided requirements.txt file:

`pip install -r requirements.txt`
Alternatively, install each dependency individually:

`pip install deepface opencv-python streamlit numpy pandas`
Running the Application
Step 3: Start the Streamlit Application
To launch the application, use the following command:

`streamlit run app.py`
This will open the application in your web browser, activating the webcam for real-time facial emotion detection.

Features & Workflow
1. Real-Time Emotion Detection
The application captures frames from the webcam and detects faces in real-time.
DeepFace analyzes each face to predict:
Emotion (e.g., happy, sad, angry, surprised, etc.)
Age
Gender
Race
The detected emotions and other attributes are overlaid on the video stream.
2. Emotion Logging
Every 1-minute interval, the dominant emotion is logged with a timestamp.
This allows tracking of emotional trends over time.
3. Download Emotion Log as CSV
Users can download the log file from the sidebar button.
The CSV file contains timestamps and corresponding dominant emotions detected.
Screenshot of the Application
Below is a preview of the application workflow:
Screenshot of the workflow

Contributing
Feel free to contribute by submitting pull requests or reporting issues.

How to Contribute
Fork the repository
-Clone the repository
   git clone [https://github.com/your-username/Job-prep-ai
-Create a new branch
   git checkout -b feature-branch
-Make your changes and commit
   git commit -m "Your message here"
-Push your changes
   git push origin feature-branch
-Submit a pull request

Developed By
👨‍💻 ECS Team - VIT-AP
📌 Thanks for visiting! 🚀
