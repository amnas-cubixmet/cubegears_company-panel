import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormPage } from '../../components/common/forms/FormPage';
import { FormSection } from '../../components/common/forms/FormSection';
import { StickyFormFooter } from '../../components/common/forms/StickyFormFooter';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Textarea } from '../../components/common/Textarea';
import { SearchableSelect } from '../../components/common/forms/SearchableSelect';
import { customerService } from '../../services/customer.service';
import { vehicleService } from '../../services/vehicle.service';
import { Car, Calendar, Gauge, ShieldCheck } from 'lucide-react';
import '../../styles/vehicle-management.css';

export const EditVehicle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    regNo: '',
    make: '',
    model: '',
    variant: '',
    year: '',
    fuelType: 'Petrol',
    transmission: 'Manual',
    color: '',
    odometer: '',
    vin: '',
    engineNo: '',
    lastServiceDate: '',
    nextServiceDue: '',
    insuranceExpiry: '',
    notes: '',
    status: 'Active'
  });

  useEffect(() => {
    let alive = true;

    Promise.all([
      vehicleService.getVehicleById(id),
      customerService.getCustomers()
    ]).then(([vehicle, customerRows]) => {
      if (!alive) return;
      setCustomers(customerRows);
      if (vehicle) {
        setFormData({
          customerId: vehicle.customerId || '',
          regNo: vehicle.registration || '',
          make: vehicle.make || '',
          model: vehicle.model || '',
          variant: vehicle.variant || '',
          year: vehicle.year || '',
          fuelType: vehicle.fuelType || 'Petrol',
          transmission: vehicle.transmission || 'Manual',
          color: vehicle.color || '',
          odometer: vehicle.odometer || '',
          vin: vehicle.vin || '',
          engineNo: vehicle.engineNo || '',
          lastServiceDate: vehicle.lastServiceDate || '',
          nextServiceDue: vehicle.nextServiceDue || '',
          insuranceExpiry: vehicle.insuranceExpiry || '',
          notes: vehicle.notes || '',
          status: vehicle.status || 'Active'
        });
      }
    }).finally(() => {
      if (alive) setLoading(false);
    });

    return () => { alive = false; };
  }, [id]);

  const customerOptions = customers.map((customer) => ({
    value: customer.id,
    label: `${customer.name} (${customer.phone}) - ID: ${customer.id}`
  }));

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const selectedCustomer = customers.find((customer) => customer.id === formData.customerId);
      await vehicleService.updateVehicle(id, {
        ...formData,
        customerName: selectedCustomer?.name || ''
      });
      navigate(`/vehicles/${id}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="vehicle-empty">Loading vehicle...</div>;

  return (
    <div className="vehicle-form-page cg-vehicles">
      <FormPage
        title="Edit Vehicle"
        description="Update customer ownership, vehicle specifications, service schedule and insurance details."
      >
        <form className="vehicle-form" onSubmit={submit}>
          <FormSection title="Customer Owner" description="Vehicle ownership and workshop customer link.">
            <div className="form-grid-full">
              <SearchableSelect
                label="Customer Owner"
                required
                options={customerOptions}
                value={formData.customerId}
                onChange={(value) => setFormData({ ...formData, customerId: value })}
                placeholder="Search customer by name or phone..."
              />
            </div>
            <Select label="Vehicle Status" value={formData.status} onChange={(e)=>setFormData({...formData,status:e.target.value})}>
              <option>Active</option>
              <option>Inactive</option>
            </Select>
          </FormSection>

          <FormSection title="Vehicle Specifications" description="Registration, chassis, engine and current odometer.">
            <div className="form-grid-full">
              <Input label="Registration Number" required icon={Car} value={formData.regNo} onChange={(e)=>setFormData({...formData,regNo:e.target.value})}/>
            </div>
            <Input label="Make / Manufacturer" required value={formData.make} onChange={(e)=>setFormData({...formData,make:e.target.value})}/>
            <Input label="Model" required value={formData.model} onChange={(e)=>setFormData({...formData,model:e.target.value})}/>
            <Input label="Variant / Edition" value={formData.variant} onChange={(e)=>setFormData({...formData,variant:e.target.value})}/>
            <Input label="Manufacturing Year" value={formData.year} onChange={(e)=>setFormData({...formData,year:e.target.value})}/>
            <Select label="Fuel Type" value={formData.fuelType} onChange={(e)=>setFormData({...formData,fuelType:e.target.value})}>
              <option>Petrol</option>
              <option>Diesel</option>
              <option>EV / Electric</option>
              <option>CNG / Hybrid</option>
            </Select>
            <Select label="Transmission" value={formData.transmission} onChange={(e)=>setFormData({...formData,transmission:e.target.value})}>
              <option>Manual</option>
              <option>Automatic</option>
              <option>CVT</option>
              <option>DCT</option>
            </Select>
            <Input label="Exterior Colour" value={formData.color} onChange={(e)=>setFormData({...formData,color:e.target.value})}/>
            <Input label="Current Odometer Reading" icon={Gauge} value={formData.odometer} onChange={(e)=>setFormData({...formData,odometer:e.target.value})}/>
            <Input label="VIN / Chassis Number" value={formData.vin} onChange={(e)=>setFormData({...formData,vin:e.target.value})}/>
            <Input label="Engine Number" value={formData.engineNo} onChange={(e)=>setFormData({...formData,engineNo:e.target.value})}/>
          </FormSection>

          <FormSection title="Service & Insurance" description="Maintenance and renewal reminder dates.">
            <Input label="Last Service Date" type="date" icon={Calendar} value={formData.lastServiceDate} onChange={(e)=>setFormData({...formData,lastServiceDate:e.target.value})}/>
            <Input label="Next Service Due Date" type="date" icon={Calendar} value={formData.nextServiceDue} onChange={(e)=>setFormData({...formData,nextServiceDue:e.target.value})}/>
            <Input label="Insurance Expiry Date" type="date" icon={ShieldCheck} value={formData.insuranceExpiry} onChange={(e)=>setFormData({...formData,insuranceExpiry:e.target.value})}/>
            <div className="form-grid-full">
              <Textarea label="Vehicle Condition & Notes" rows={3} value={formData.notes} onChange={(e)=>setFormData({...formData,notes:e.target.value})}/>
            </div>
          </FormSection>

          <StickyFormFooter
            statusText={`Editing ${formData.regNo || id}`}
            cancelLabel="Cancel"
            saveLabel="Update Vehicle"
            isSubmitting={submitting}
            onCancel={() => navigate(`/vehicles/${id}`)}
          />
        </form>
      </FormPage>
    </div>
  );
};

export default EditVehicle;
