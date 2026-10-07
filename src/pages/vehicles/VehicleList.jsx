import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  VehicleDirectoryPanel,
  VehicleOverviewStats,
  VehicleSearchToolbar,
  VehiclesHeader,
} from '../../components/vehicles';
import { OPEN_JOB_STATUSES, dateDiff } from '../../components/vehicles/vehicles.utils';
import { customerService } from '../../services/customer.service';
import { jobService } from '../../services/job.service';
import { vehicleService } from '../../services/vehicle.service';
import '../../styles/vehicle-management.css';

export const VehicleList = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);

      try {
        const [vehicleRows, customers] = await Promise.all([
          vehicleService.getVehicles(),
          customerService.getCustomers(),
        ]);

        const customerMap = new Map(
          (customers || []).map((customer) => [String(customer.id), customer]),
        );

        const enriched = await Promise.all(
          (vehicleRows || []).map(async (vehicle) => {
            const customer = customerMap.get(String(vehicle.customerId));
            const history = await jobService.getVehicleHistory(vehicle.registration);
            const openJob =
              (history || []).find((job) => OPEN_JOB_STATUSES.has(job.status)) ||
              null;
            const latestJob = history?.[0] || null;

            return {
              ...vehicle,
              customer,
              customerName:
                customer?.name ||
                vehicle.customerName ||
                'Unknown Customer',
              customerPhone:
                customer?.phone ||
                vehicle.customerPhone ||
                '',
              history: Array.isArray(history) ? history : [],
              openJob,
              latestJob,
            };
          }),
        );

        if (active) setVehicles(enriched);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const filteredVehicles = useMemo(() => {
    const search = query.trim().toLowerCase().replace(/\s+/g, '');
    if (!search) return vehicles;

    return vehicles.filter((vehicle) =>
      [
        vehicle.registration,
        vehicle.vin,
        vehicle.make,
        vehicle.model,
        vehicle.customerName,
        vehicle.customerPhone,
      ].some((value) =>
        String(value || '')
          .toLowerCase()
          .replace(/\s+/g, '')
          .includes(search),
      ),
    );
  }, [vehicles, query]);

  const metrics = useMemo(() => {
    const serviceDue = vehicles.filter((vehicle) => {
      const days = dateDiff(vehicle.nextServiceDue);
      return days !== null && days <= 30;
    }).length;

    const insuranceDue = vehicles.filter((vehicle) => {
      const days = dateDiff(vehicle.insuranceExpiry);
      return days !== null && days <= 30;
    }).length;

    return {
      total: vehicles.length,
      active: vehicles.filter((vehicle) => vehicle.status !== 'Inactive').length,
      openJobs: vehicles.filter((vehicle) => vehicle.openJob).length,
      serviceDue,
      insuranceDue,
    };
  }, [vehicles]);

  return (
    <div className="vehicle-management-page cg-vehicles vehicle-dashboard">
      <VehiclesHeader onAddVehicle={() => navigate('/vehicles/new')} />

      {loading ? (
        <div className="vehicle-dashboard-loading">Loading vehicles…</div>
      ) : (
        <>
          <VehicleOverviewStats metrics={metrics} />

          <VehicleSearchToolbar
            query={query}
            onQueryChange={setQuery}
            resultCount={filteredVehicles.length}
          />

          <VehicleDirectoryPanel
            vehicles={filteredVehicles}
            onNavigate={navigate}
          />
        </>
      )}
    </div>
  );
};

export const AddVehicle = VehicleList;

export default VehicleList;
