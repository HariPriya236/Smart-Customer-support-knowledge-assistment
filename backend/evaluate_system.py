import json
import time
import random
import logging
from typing import List, Dict, Any
from app.agents.graph import run_supportiq_agent_pipeline

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Sample Categories
CATEGORIES = [
    "FAQs", "User Manuals", "Product Documentation",
    "Troubleshooting Guides", "Warranty Policies",
    "Refund Policies", "Internal Knowledge Bases"
]

def generate_100_test_queries() -> List[Dict[str, Any]]:
    """Generates a dataset of 100 synthetic benchmark test queries."""
    templates = [
        ("What is the warranty coverage for model {x}?", "Warranty Policies", True),
        ("How do I request a full refund within {n} days?", "Refund Policies", True),
        ("Troubleshooting error code ERR-{code} during setup", "Troubleshooting Guides", True),
        ("How to pair Bluetooth headset with smartphone?", "User Manuals", True),
        ("What are the power requirements for product X-100?", "Product Documentation", True),
        ("Where can I update my billing email address?", "FAQs", True),
        ("Internal procedure for processing enterprise customer SLA escalation", "Internal Knowledge Bases", True),
        ("Can I get a refund after 5 years of usage without receipt?", "Refund Policies", False), # Edge case/impossible
        ("What is the quantum flux density of the device?", "Product Documentation", False), # Out of scope query
        ("How to troubleshoot unexpected restart during firmware upload?", "Troubleshooting Guides", True),
    ]

    dataset = []
    idx = 1
    while len(dataset) < 100:
        template, cat, is_answerable = random.choice(templates)
        q_text = template.format(x=random.randint(100, 900), n=random.choice([14, 30, 60]), code=random.randint(1000, 9999))
        dataset.append({
            "id": f"TEST-{idx:03d}",
            "query": q_text,
            "expected_category": cat,
            "is_answerable": is_answerable
        })
        idx += 1

    return dataset

def evaluate_system():
    logger.info("Initializing SupportIQ Automated Benchmark Evaluation (100 Queries)...")
    test_suite = generate_100_test_queries()

    correct_retrievals = 0
    correct_category_detections = 0
    hallucinations_detected = 0
    tp, fp, fn = 0, 0, 0
    total_time_ms = 0

    results = []

    for item in test_suite:
        start = time.time()
        output = run_supportiq_agent_pipeline(user_query=item["query"], llm_provider="gemini")
        elapsed = (time.time() - start) * 1000
        total_time_ms += elapsed

        det_cat = output.get("detected_category")
        confidence = output.get("confidence_score", 0.0)
        is_escalated = output.get("is_escalated", False)
        answer = output.get("generated_answer", "")

        # 1. Category Detection Accuracy
        cat_match = (det_cat == item["expected_category"])
        if cat_match:
            correct_category_detections += 1

        # 2. Retrieval Accuracy
        retrieved_count = len(output.get("retrieved_chunks", []))
        retrieval_ok = (retrieved_count > 0) if item["is_answerable"] else True
        if retrieval_ok:
            correct_retrievals += 1

        # 3. Precision / Recall / F1 classification (Answerable vs Escalated)
        if item["is_answerable"]:
            if not is_escalated and confidence >= 0.60:
                tp += 1
            else:
                fn += 1
        else:
            if not is_escalated and confidence >= 0.60:
                fp += 1
                hallucinations_detected += 1
            else:
                # Correctly flagged unanswerable query
                pass

        results.append({
            "id": item["id"],
            "query": item["query"],
            "expected_category": item["expected_category"],
            "detected_category": det_cat,
            "confidence_score": confidence,
            "is_escalated": is_escalated,
            "latency_ms": round(elapsed, 1)
        })

    # Calculations
    total = len(test_suite)
    retrieval_accuracy = (correct_retrievals / total) * 100
    category_accuracy = (correct_category_detections / total) * 100
    precision = (tp / (tp + fp)) * 100 if (tp + fp) > 0 else 0.0
    recall = (tp / (tp + fn)) * 100 if (tp + fn) > 0 else 0.0
    f1_score = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
    accuracy = ((tp + (total - tp - fp - fn)) / total) * 100
    hallucination_rate = (hallucinations_detected / total) * 100
    avg_latency = total_time_ms / total

    report = {
        "metrics": {
            "Total Test Queries": total,
            "Accuracy": f"{accuracy:.2f}%",
            "Precision": f"{precision:.2f}%",
            "Recall": f"{recall:.2f}%",
            "F1 Score": f"{f1_score:.2f}%",
            "Retrieval Accuracy": f"{retrieval_accuracy:.2f}%",
            "Category Detection Accuracy": f"{category_accuracy:.2f}%",
            "Hallucination Rate": f"{hallucination_rate:.2f}%",
            "Average Response Time": f"{avg_latency:.1f} ms"
        },
        "detailed_results": results
    }

    # Print clean summary table
    print("\n" + "="*60)
    print("           SUPPORTIQ SYSTEM EVALUATION REPORT           ")
    print("="*60)
    for k, v in report["metrics"].items():
        print(f"  {k:<32} : {v}")
    print("="*60 + "\n")

    with open("evaluation_report.json", "w") as f:
        json.dump(report, f, indent=2)

    logger.info("Evaluation complete! Full report written to evaluation_report.json")

if __name__ == "__main__":
    evaluate_system()
