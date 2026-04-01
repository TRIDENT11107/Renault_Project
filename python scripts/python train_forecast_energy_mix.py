# ============================================================
# ENERGY MIX FORECAST — FULL TRAINING SCRIPT
# ============================================================

from pathlib import Path
import numpy as np
import pandas as pd
from prophet import Prophet
import plotly.graph_objects as go

# ============================================================
# STEP 1 — LOAD CLEAN DATASET
# ============================================================

df = pd.read_csv(Path(__file__).with_name("clean_energy_mix_data.csv"))

print("Input Data:")
print(df)

# ============================================================
# STEP 2 — FORECAST FUNCTION (Reusable)
# ============================================================

def forecast_fuel(data, fuel_name, years_to_predict=5):

    temp = data[["Year", fuel_name]].copy()

    # Prophet requires ds (date) and y (value)
    temp.rename(columns={
        "Year": "ds",
        fuel_name: "y"
    }, inplace=True)

    temp["ds"] = pd.to_datetime(temp["ds"], format="%Y")
    temp = temp.sort_values("ds")

    # Train model
    model = Prophet()

    try:
        model.fit(temp)

        # Predict future
        future = model.make_future_dataframe(
            periods=years_to_predict,
            freq="Y"
        )

        forecast = model.predict(future)

        return forecast[["ds", "yhat"]]
    except Exception:
        years = temp["ds"].dt.year.to_numpy()
        y = temp["y"].to_numpy(dtype=float)

        # Fallback: linear trend if Prophet/CmdStan crashes in this environment.
        slope, intercept = np.polyfit(years, y, 1)
        future_years = np.arange(years.min(), years.max() + years_to_predict + 1)

        return pd.DataFrame({
            "ds": pd.to_datetime(future_years, format="%Y"),
            "yhat": slope * future_years + intercept
        })
# ============================================================
# STEP 3 — TRAIN MODELS FOR ALL FUELS
# ============================================================

petrol_forecast = forecast_fuel(df, "Petrol")
diesel_forecast = forecast_fuel(df, "Diesel")
cng_forecast = forecast_fuel(df, "CNG")
ev_forecast = forecast_fuel(df, "EV")

# ============================================================
# STEP 4 — COMBINE PREDICTIONS
# ============================================================

result = petrol_forecast.rename(columns={"yhat": "Petrol"})

result["Diesel"] = diesel_forecast["yhat"]
result["CNG"] = cng_forecast["yhat"]
result["EV"] = ev_forecast["yhat"]

result["Year"] = result["ds"].dt.year

print("\nForecast Result:")
print(result)

# ============================================================
# STEP 5 — SAVE FORECAST DATA
# ============================================================

result.to_csv("forecast_energy_mix.csv", index=False)

print("\nForecast saved as forecast_energy_mix.csv")

# ============================================================
# STEP 6 — PLOT ENERGY MIX EVOLUTION
# ============================================================

fig = go.Figure()

fig.add_trace(go.Scatter(
    x=result["Year"],
    y=result["Petrol"],
    mode='lines',
    name='Petrol',
    stackgroup='one'
))

fig.add_trace(go.Scatter(
    x=result["Year"],
    y=result["Diesel"],
    mode='lines',
    name='Diesel',
    stackgroup='one'
))

fig.add_trace(go.Scatter(
    x=result["Year"],
    y=result["CNG"],
    mode='lines',
    name='CNG',
    stackgroup='one'
))

fig.add_trace(go.Scatter(
    x=result["Year"],
    y=result["EV"],
    mode='lines',
    name='EV',
    stackgroup='one'
))

fig.update_layout(
    title="5-Year Energy Mix Evolution with Forecast (VAHAN Data)",
    xaxis_title="Year",
    yaxis_title="Vehicle Registrations",
    hovermode="x unified"
)

fig.show()

# ============================================================
# END
# ============================================================




