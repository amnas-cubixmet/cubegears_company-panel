import React from 'react';
import { Edit3, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { hasPermission } from '../../utils/permissions';

const statusClass=(status='')=>String(status).toLowerCase()==='active'?'is-active':'is-inactive';

export const ServiceCategoriesPanel = ({ categories, services, onAdd, onEdit, onDelete }) => {
  const { user } = useAuth();
  const canCreate=hasPermission(user,'services.create');
  const canEdit=hasPermission(user,'services.edit');
  const canDelete=hasPermission(user,'services.delete');

  return (
    <section className="service-category-section">
      <div className="service-section-header">
        <div><h2>Service Categories</h2><p>Group workshop services into practical labour departments.</p></div>
        {canCreate&&<button className="service-primary-button" onClick={onAdd}><Plus size={14}/> Add Category</button>}
      </div>
      <div className="service-category-grid">
        {categories.map(category=>{
          const count=services.filter(service=>service.categoryId===category.id||service.category===category.name).length;
          return (
            <article key={category.id} className="service-category-card">
              <div className="service-category-card__head">
                <div><span>{category.id}</span><strong>{category.name}</strong></div>
                <b className={'service-status '+statusClass(category.status)}>{category.status}</b>
              </div>
              <p>{category.description||'Workshop service category.'}</p>
              <div className="service-category-summary">
                <span>Services <b>{count}</b></span>
                <span>Service Types <b>{category.types?.length||0}</b></span>
              </div>
              {(canEdit||canDelete)&&(
                <div className="service-card-actions is-two">
                  {canEdit&&<button onClick={()=>onEdit(category)}><Edit3 size={13}/> Edit</button>}
                  {canDelete&&<button className="is-danger" onClick={()=>onDelete(category)}><Trash2 size={13}/> Delete</button>}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
};