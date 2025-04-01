## Dependencies
- [deepface](https://github.com/serengil/deepface): A deep learning facial analysis library that provides pre-trained models for facial emotion detection. It relies on TensorFlow for the underlying deep learning operations.
- [OpenCV](https://opencv.org/): An open-source computer vision library used for image and video processing.

1. Install the required dependencies:
   - first create a virtual environment and install dependencies
   - next activate and run using the command `streamlit run app.py`
   - You can use `pip install -r requirements.txt`
   - Or you can install dependencies individually:
      - `pip install deepface`
      - `pip install opencv-python`
3. Run the code:
   - Execute the Python script.
   - The webcam will open, and real-time facial emotion detection will start.
   - Emotion labels will be displayed on the frames around detected faces. (Using the DeepFace extended models to predict age, emotions, gender and racial identity of the persons.)
4. Download CSV Files
   - use the button in the side panel to download a log of most dominant emotions for every 1 minute interval


