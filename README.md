# **Threads Bullshit Blocker 🛡️**

A Chrome extension that detects and flags Frankfurt-style bullshit on Threads.net. Based on the philosophical work of Harry Frankfurt, this tool helps you identify content that disregards the truth, not just content that is factually incorrect.

## **What is Frankfurt-Style Bullshit?**

In his essay "On Bullshit," philosopher Harry Frankfurt draws a distinction between lying and bullshitting.

* A **liar** knows the truth but deliberately tries to conceal it.  
* A **bullshitter** doesn't care what the truth is. They are only interested in creating a certain impression.

This extension is designed to detect the latter: language that is evasive, manipulative, and indifferent to the truth.

## **Features**

* **🔎 Real-Time Analysis**: Scans posts on Threads.net as you browse.  
* **📊 BS Score**: Each post is given a "Bullshit Score" based on an analysis of its content.  
* **🚩 Flagging System**: Posts that exceed a certain BS threshold are flagged with a clear warning.  
* **🎚️ Adjustable Sensitivity**: You can adjust the detection sensitivity in the extension's popup menu.  
* **🔒 Privacy-Focused**: All analysis is done locally in your browser. No data is ever sent to a server.

## **Installation**

### **From the Chrome Web Store (Coming Soon\!)**

You will be able to install the Threads Bullshit Blocker directly from the Chrome Web Store.

### **Manual Installation (For Developers)**

1. **Download the code**: Clone or download this repository to your local machine.  
   git clone https://github.com/YOUR\_USERNAME/threads-bullshit-blocker.git

2. **Open Chrome Extensions**: Open Google Chrome and navigate to chrome://extensions.  
3. **Enable Developer Mode**: In the top right corner, toggle the "Developer mode" switch on.  
4. **Load the Extension**: Click the **"Load unpacked"** button and select the threads-bullshit-blocker directory that you downloaded.

The extension should now be active and visible in your browser's toolbar.

## **How It Works**

The extension analyzes the text of each post on Threads against a comprehensive dictionary of words and phrases categorized by different types of bullshit, including:

* **Hedging Words**: Language that avoids making direct claims.  
* **Vague Authority Appeals**: Citing "experts" or "studies" without specifics.  
* **Empty Intensifiers**: Words that add emotion but not substance.  
* **Buzzword Soup**: Using jargon to sound impressive without saying anything.  
* ...and 11 other categories\!

## **Contributing**

Contributions are welcome\! If you have suggestions for improving the detection algorithm or adding new features, please open an issue or submit a pull request.

## **License**

This project is licensed under the MIT License.