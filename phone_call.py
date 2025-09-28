#!/usr/bin/env python3
"""
Enhanced Twilio Emergency Call Handler - Inbound Calls Only
Handles emergency calls with speech-to-text and AI analysis
"""
from flask import Flask, request, jsonify
from twilio.twiml.voice_response import VoiceResponse, Gather
import os
import openai
from datetime import datetime
import json
import logging

# --- LOGGING SETUP ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- CONFIG ---
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    raise ValueError("Set your OpenAI API key in the OPENAI_API_KEY environment variable.")

openai.api_key = OPENAI_API_KEY
app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY")

# Store call data in memory (use database in production)
call_sessions = {}

# --- EMERGENCY QUESTIONS ---
EMERGENCY_QUESTIONS = [
    "What is your exact location or address?",
    "I have sent a drone to scout the location. Are there any hazards I should be aware of?"
]

def analyze_emergency_response(question, response_text):
    """
    Use OpenAI to analyze and clean up the speech-to-text response
    """
    prompt = f"""
    The emergency operator asked: "{question}"
    The caller responded: "{response_text}"
    
    Extract the key information from the caller's response. If the speech-to-text seems garbled or unclear, make your best interpretation. Provide a clean, concise summary of what the caller said.
    
    Respond with just the cleaned-up information, no additional text.
    """
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=150
        )
        
        return response.choices[0].message.content.strip()
        
    except Exception as e:
        logger.error(f"Error analyzing response: {e}")
        return response_text  # Return original if analysis fails

def generate_emergency_summary(call_data):
    """
    Generate final emergency summary using OpenAI
    """
    prompt = f"""
    Based on this emergency call information:
    
    Initial Emergency: {call_data.get('initial_emergency', 'Not provided')}
    Location: {call_data.get('location', 'Not provided')}
    People at Risk: {call_data.get('people_count', 'Not provided')}
    Hazards: {call_data.get('hazards', 'Not provided')}
    
    Generate a concise emergency report with:
    - Severity level (low/medium/high/critical)
    - Key facts for emergency responders
    - Recommended response priority
    
    Format as JSON:
    {{
        "severity": "level",
        "summary": "brief summary",
        "priority": "response priority",
        "responder_notes": "key info for responders"
    }}
    """
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=300
        )
        
        content = response.choices[0].message.content.strip()
        return json.loads(content)
        
    except Exception as e:
        logger.error(f"Error generating summary: {e}")
        return {
            "severity": "medium",
            "summary": "Emergency call processed with incomplete information",
            "priority": "standard",
            "responder_notes": "Review call details for more information"
        }

# --- MAIN WEBHOOK: Handle all inbound calls ---
@app.route("/webhook", methods=["POST"])
def handle_inbound_call():
    """
    Main webhook for handling inbound emergency calls
    This is the entry point for all incoming calls to your Twilio number
    """
    try:
        from_number = request.form.get("From", "unknown")
        call_sid = request.form.get("CallSid", "unknown")
        call_status = request.form.get("CallStatus", "unknown")
        
        logger.info(f"Inbound call from {from_number}, SID: {call_sid}, Status: {call_status}")
        
        # Only handle ringing/in-progress calls
        if call_status not in ["ringing", "in-progress"]:
            logger.info(f"Ignoring call with status: {call_status}")
            return "", 200
        
        # Initialize call session
        call_sessions[call_sid] = {
            "from_number": from_number,
            "timestamp": datetime.utcnow().isoformat(),
            "current_question": 0,
            "responses": {}
        }
        
        response = VoiceResponse()
        response.say(
            "Emergency services. Please briefly describe your emergency.",
            voice="Polly.Joanna"
        )
        
        # Gather initial emergency description
        gather = Gather(
            input="speech",
            timeout=10,
            speech_timeout="auto",
            action="/process_initial",
            method="POST"
        )
        response.append(gather)
        
        # Fallback if no speech detected
        response.say("I didn't receive your response. Let me ask you some specific questions.")
        response.redirect("/ask_question?question=0")
        
        return str(response)
        
    except Exception as e:
        logger.error(f"Error handling inbound call: {e}")
        response = VoiceResponse()
        response.say("We're experiencing technical difficulties. Please hang up and call 911 directly.")
        return str(response)

# --- ROUTE: Process initial emergency description ---
@app.route("/process_initial", methods=["POST"])
def process_initial():
    """
    Process the initial emergency description from caller
    """
    try:
        call_sid = request.form.get("CallSid")
        speech_result = request.form.get("SpeechResult", "")
        
        if call_sid not in call_sessions:
            logger.error(f"Call session not found for SID: {call_sid}")
            response = VoiceResponse()
            response.say("Let me ask you some questions to help emergency responders.")
            response.redirect("/ask_question?question=0")
            return str(response)
        
        # Store initial emergency description
        call_sessions[call_sid]["initial_emergency"] = speech_result
        logger.info(f"Initial emergency for {call_sid}: {speech_result}")
        
        response = VoiceResponse()
        response.say("Thank you. I need to ask you 3 quick questions to help emergency responders.")
        response.redirect("/ask_question?question=0")
        
        return str(response)
        
    except Exception as e:
        logger.error(f"Error processing initial response: {e}")
        response = VoiceResponse()
        response.say("Let me ask you some questions.")
        response.redirect("/ask_question?question=0")
        return str(response)

# --- ROUTE: Ask specific questions ---
@app.route("/ask_question", methods=["POST", "GET"])
def ask_question():
    """
    Ask emergency questions one at a time
    """
    try:
        call_sid = request.form.get("CallSid") or request.args.get("CallSid")
        question_num = int(request.args.get("question", "0"))
        
        if call_sid and call_sid not in call_sessions:
            logger.error(f"Call session not found for SID: {call_sid}")
            response = VoiceResponse()
            response.say("Your emergency has been noted. Emergency services will be contacted.")
            response.hangup()
            return str(response)
        
        if question_num >= len(EMERGENCY_QUESTIONS):
            # All questions completed
            return finalize_call(call_sid)
        
        # Update current question
        if call_sid in call_sessions:
            call_sessions[call_sid]["current_question"] = question_num
        
        response = VoiceResponse()
        
        # Ask the current question
        gather = Gather(
            input="speech",
            timeout=15,
            speech_timeout="auto",
            action=f"/process_answer?question={question_num}",
            method="POST"
        )
        gather.say(f"Question {question_num + 1}: {EMERGENCY_QUESTIONS[question_num]}", voice="Polly.Joanna")
        response.append(gather)
        
        # Fallback for no response
        response.say("I didn't hear your response.")
        if question_num < len(EMERGENCY_QUESTIONS) - 1:
            response.redirect(f"/ask_question?question={question_num + 1}")
        else:
            response.redirect("/finalize_call")
        
        return str(response)
        
    except Exception as e:
        logger.error(f"Error asking question: {e}")
        response = VoiceResponse()
        response.say("Emergency services have been notified. Please stay on the line if possible.")
        response.redirect("/finalize_call")
        return str(response)

# --- ROUTE: Process answers ---
@app.route("/process_answer", methods=["POST"])
def process_answer():
    """
    Process caller's answer to specific question
    """
    try:
        call_sid = request.form.get("CallSid")
        question_num = int(request.args.get("question", "0"))
        speech_result = request.form.get("SpeechResult", "")
        
        if call_sid not in call_sessions:
            logger.error(f"Call session not found for SID: {call_sid}")
            response = VoiceResponse()
            next_q = question_num + 1
            if next_q < len(EMERGENCY_QUESTIONS):
                response.redirect(f"/ask_question?question={next_q}")
            else:
                response.redirect("/finalize_call")
            return str(response)
        
        # Analyze and clean up the response using AI
        question_text = EMERGENCY_QUESTIONS[question_num]
        cleaned_response = analyze_emergency_response(question_text, speech_result)
        
        # Store response with both original and cleaned versions
        response_key = ["location", "people_count", "hazards"][question_num]
        call_sessions[call_sid]["responses"][response_key] = {
            "original": speech_result,
            "cleaned": cleaned_response
        }
        
        logger.info(f"Q{question_num + 1} Response for {call_sid}: {cleaned_response}")
        
        response = VoiceResponse()
        
        # Provide brief confirmation to caller
        confirmations = [
            "Got the location.",
            "Understood about the people involved.",
            "I have the hazard information."
        ]
        response.say(confirmations[question_num])
        
        # Move to next question or finalize
        next_question = question_num + 1
        if next_question < len(EMERGENCY_QUESTIONS):
            response.redirect(f"/ask_question?question={next_question}")
        else:
            response.redirect("/finalize_call")
        
        return str(response)
        
    except Exception as e:
        logger.error(f"Error processing answer: {e}")
        response = VoiceResponse()
        next_q = int(request.args.get("question", "0")) + 1
        if next_q < len(EMERGENCY_QUESTIONS):
            response.redirect(f"/ask_question?question={next_q}")
        else:
            response.redirect("/finalize_call")
        return str(response)

# --- ROUTE: Finalize call ---
@app.route("/finalize_call", methods=["POST", "GET"])
def finalize_call(call_sid=None):
    """
    Generate emergency report and conclude the call
    """
    try:
        if not call_sid:
            call_sid = request.form.get("CallSid") or request.args.get("CallSid")
        
        if call_sid and call_sid in call_sessions:
            call_data = call_sessions[call_sid]
            
            # Prepare data for AI analysis
            analysis_data = {
                "initial_emergency": call_data.get("initial_emergency", ""),
                "location": call_data.get("responses", {}).get("location", {}).get("cleaned", ""),
                "people_count": call_data.get("responses", {}).get("people_count", {}).get("cleaned", ""),
                "hazards": call_data.get("responses", {}).get("hazards", {}).get("cleaned", "")
            }
            
            # Generate emergency summary using AI
            summary = generate_emergency_summary(analysis_data)
            
            # Create comprehensive final report
            final_report = {
                "call_sid": call_sid,
                "from_number": call_data["from_number"],
                "timestamp": call_data["timestamp"],
                "initial_emergency": call_data.get("initial_emergency", ""),
                "responses": call_data.get("responses", {}),
                "ai_summary": summary,
                "status": "completed"
            }
            
            # Log the emergency report
            logger.info("=== EMERGENCY REPORT ===")
            logger.info(json.dumps(final_report, indent=2))
            
            # Clean up the call session
            del call_sessions[call_sid]
            
            # Provide appropriate response to caller based on severity
            response = VoiceResponse()
            
            if summary.get("severity") in ["high", "critical"]:
                response.say("This is a high priority emergency. Multiple emergency units are being dispatched immediately.")
            else:
                response.say("Thank you for providing the information. Emergency responders have been notified and are on their way.")
            
            response.say("Please stay safe and follow any instructions from emergency personnel when they arrive.")
            response.hangup()
            
            return str(response)
        
        else:
            # No call session found, provide generic closure
            response = VoiceResponse()
            response.say("Your emergency information has been recorded. Emergency services will respond shortly.")
            response.hangup()
            return str(response)
        
    except Exception as e:
        logger.error(f"Error finalizing call: {e}")
        response = VoiceResponse()
        response.say("Your emergency has been recorded. Please call 911 if you need immediate assistance.")
        response.hangup()
        return str(response)

# --- UTILITY ROUTES ---

@app.route("/health", methods=["GET"])
def health_check():
    """
    Health check endpoint for monitoring
    """
    return jsonify({
        "status": "healthy",
        "service": "inbound_emergency_handler",
        "timestamp": datetime.utcnow().isoformat(),
        "openai_configured": bool(OPENAI_API_KEY),
        "active_calls": len(call_sessions)
    })

@app.route("/debug/calls", methods=["GET"])
def debug_calls():
    """
    Debug endpoint to view active call sessions
    """
    return jsonify({
        "active_calls": len(call_sessions),
        "calls": {k: {
            "from_number": v.get("from_number"),
            "timestamp": v.get("timestamp"),
            "current_question": v.get("current_question"),
            "responses_count": len(v.get("responses", {})),
            "has_initial_emergency": bool(v.get("initial_emergency"))
        } for k, v in call_sessions.items()}
    })

if __name__ == "__main__":
    logger.info("Starting Twilio Inbound Emergency Call Handler")
    logger.info(f"OpenAI configured: {bool(OPENAI_API_KEY)}")
    logger.info("Configure your Twilio phone number webhook to: https://your-domain.com/webhook")
    
    app.run(host="0.0.0.0", port=2133, debug=False)