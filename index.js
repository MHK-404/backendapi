const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for the frontend domain
app.use(cors({
  origin: 'https://icy-grass-028f08d00.6.azurestaticapps.net' // Allow requests from the frontend
}));

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Risk Calculator Backend!');
});

// RESTful API to wake up the server
app.get('/wake-up', (req, res) => {
  res.json({ message: 'Server is awake' });
});

// RESTful API to calculate risk
app.post('/calculate-risk', (req, res) => {
  const { age, height, weight, systolic, diastolic, familyHistory } = req.body;

  // Validate inputs
  if (height < 60) {
    return res.status(400).json({ error: 'Height must be at least 60 cm.' });
  }
  if (weight <= 0) {
    return res.status(400).json({ error: 'Weight must be greater than 0 kg.' });
  }
  if (systolic < 50 || systolic > 300 || diastolic < 30 || diastolic > 200) {
    return res.status(400).json({ error: 'Please enter valid blood pressure values.' });
  }

  // Calculate BMI
  const heightInMeters = height / 100;
  const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(2);

  // Calculate risk points
  const agePoints = calculateAgePoints(age);
  const bmiPoints = calculateBMIPoints(bmi);
  const bpPoints = calculateBloodPressurePoints(systolic, diastolic);
  const familyHistoryPoints = calculateFamilyHistoryPoints(familyHistory);

  // Total risk score
  const totalScore = agePoints + bmiPoints + bpPoints + familyHistoryPoints;
  const riskCategory = determineRiskCategory(totalScore);

  // Send response
  res.json({ bmi, totalScore, riskCategory });
});

// Route to demonstrate CORS failure
app.get('/no-cors', (req, res) => {
  // Do not allow CORS for this route
  res.json({ message: 'This route has no CORS' });
});

// Start the server
const PORT = process.env.PORT || 8080; // Use 8080 as the default port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Helper functions
function calculateAgePoints(age) {
  if (age < 30) return 0;
  if (age < 45) return 10;
  if (age < 60) return 20;
  return 30;
}

function calculateBMIPoints(bmi) {
  if (bmi >= 18.5 && bmi <= 24.9) return 0; // Normal
  if (bmi >= 25 && bmi <= 29.9) return 30; // Overweight
  return 75; // Obese
}

function calculateBloodPressurePoints(systolic, diastolic) {
  if (systolic < 120 && diastolic < 80) return 0; // Normal
  if (systolic < 130 && diastolic < 80) return 15; // Elevated
  if (systolic < 140 || diastolic < 90) return 30; // Stage 1
  if (systolic < 180 || diastolic < 120) return 75; // Stage 2
  return 100; // Crisis
}

function calculateFamilyHistoryPoints(familyHistory) {
  let points = 0;
  if (familyHistory.includes('diabetes')) points += 10;
  if (familyHistory.includes('cancer')) points += 10;
  if (familyHistory.includes('alzheimer')) points += 10;
  return points;
}

function determineRiskCategory(totalScore) {
  if (totalScore <= 20) return 'Low Risk';
  if (totalScore <= 50) return 'Moderate Risk';
  if (totalScore <= 75) return 'High Risk';
  return 'Uninsurable';
}
