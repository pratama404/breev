import os
import subprocess
import itertools

def run_hyperparameter_search():
    # Define hyperparameter grid
    # Tuning Phase 4: Pushing R2 > 0.7 (Context & Features)
    learning_rates = [0.001]
    hidden_sizes = [128]
    num_layers_list = [3]
    epochs_list = [200]
    seq_length_list = [24]         # Capture full 24h daily cycle!
    
    # Path to train.py
    train_script = "train.py"
    
    experiment_count = 0
    total_experiments = len(learning_rates) * len(hidden_sizes) * len(num_layers_list) * len(epochs_list) * len(seq_length_list)
    
    print(f"🚀 Starting Hyperparameter Search: {total_experiments} Experiments planned.")
    
    for lr, hidden, layers, epochs, seq_len in itertools.product(learning_rates, hidden_sizes, num_layers_list, epochs_list, seq_length_list):
        experiment_count += 1
        print(f"\n[{experiment_count}/{total_experiments}] Running Experiment: LR={lr}, Hidden={hidden}, Layers={layers}, Epochs={epochs}, SeqLen={seq_len} + Dropout=0.3 + TimeFeatures")
        
        # Construct command
        # We rely on the current python environment (conda active mlsystem)
        cmd = [
            "python", train_script,
            "--learning_rate", str(lr),
            "--hidden_size", str(hidden),
            "--num_layers", str(layers),
            "--epochs", str(epochs),
            "--seq_length", str(seq_len),
            "--dropout", "0.3",
            "--data_path", "c:/Users/ageng/Downloads/air/_unused_legacy_eksperimen/data/processed/aqi_cleaned.csv"
        ]
        
        try:
            subprocess.run(cmd, check=True)
            print(f"✅ Experiment {experiment_count} Success.")
        except subprocess.CalledProcessError as e:
            print(f"❌ Experiment {experiment_count} Failed: {e}")
            
    print("\n🏁 Hyperparameter Search Complete! Check DagsHub for results.")

if __name__ == "__main__":
    # Ensure .env variables are loaded roughly (though train.py should handle its own dotenv if needed, 
    # but currently we rely on system env or user context)
    run_hyperparameter_search()
