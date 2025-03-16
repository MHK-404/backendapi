module.exports = async function (context, req) {
    // Log the request body
    context.log('Request body:', req.body);

    // Get request body
    const { age, height, weight, systolic, diastolic, familyHistory } = req.body;

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

    // Log the results
    context.log('Results:', { bmi, totalScore, riskCategory });

    // Send response
    context.res = {
        status: 200,
        body: { bmi, totalScore, riskCategory },
    };
};

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