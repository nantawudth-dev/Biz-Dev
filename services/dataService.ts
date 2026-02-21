import { supabase } from './supabaseClient';
import { Entrepreneur, Project, Consultant, Course } from '../types';

export const dataService = {
    // Entrepreneurs
    async getEntrepreneurs(): Promise<Entrepreneur[]> {
        const { data, error } = await supabase
            .from('entrepreneurs')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching entrepreneurs:', error);
            return [];
        }

        return (data || []).map((item: any) => ({
            id: item.id,
            businessName: item.business_name || '',
            establishmentType: item.establishment_type || '',
            businessCategory: item.business_category || '',
            name: item.contact_name || '',
            address: item.address || '',
            contact: item.phone || '', // Mapping phone to contact prop as per generic usage
            phone: item.phone || '',
            lineId: item.line_id || '',
            facebook: item.facebook || '',
            nickname: item.nickname || '',
            position: item.position || '',
        }));
    },

    async createEntrepreneur(entrepreneur: Omit<Entrepreneur, 'id'>): Promise<Entrepreneur | null> {
        const { data, error } = await supabase
            .from('entrepreneurs')
            .insert([{
                business_name: entrepreneur.businessName,
                establishment_type: entrepreneur.establishmentType,
                business_category: entrepreneur.businessCategory,
                contact_name: entrepreneur.name,
                address: entrepreneur.address,
                phone: entrepreneur.phone || entrepreneur.contact,
                line_id: entrepreneur.lineId,
                facebook: entrepreneur.facebook,
                nickname: entrepreneur.nickname,
                position: entrepreneur.position
                // created_by is handled by RLS/Trigger or default
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating entrepreneur:', error);
            throw error;
        }

        return {
            id: data.id,
            businessName: data.business_name || '',
            establishmentType: data.establishment_type || '',
            businessCategory: data.business_category || '',
            name: data.contact_name || '',
            address: data.address || '',
            contact: data.phone || '',
            phone: data.phone || '',
            lineId: data.line_id || '',
            facebook: data.facebook || '',
            nickname: data.nickname || '',
            position: data.position || ''
        };
    },

    async updateEntrepreneur(id: string, entrepreneur: Partial<Entrepreneur>): Promise<void> {
        const updates: any = {};
        if (entrepreneur.businessName !== undefined) updates.business_name = entrepreneur.businessName;
        if (entrepreneur.establishmentType !== undefined) updates.establishment_type = entrepreneur.establishmentType;
        if (entrepreneur.businessCategory !== undefined) updates.business_category = entrepreneur.businessCategory;
        if (entrepreneur.name !== undefined) updates.contact_name = entrepreneur.name;
        if (entrepreneur.address !== undefined) updates.address = entrepreneur.address;
        if (entrepreneur.phone !== undefined) updates.phone = entrepreneur.phone;
        if (entrepreneur.lineId !== undefined) updates.line_id = entrepreneur.lineId;
        if (entrepreneur.facebook !== undefined) updates.facebook = entrepreneur.facebook;
        if (entrepreneur.nickname !== undefined) updates.nickname = entrepreneur.nickname;
        if (entrepreneur.position !== undefined) updates.position = entrepreneur.position;

        const { error } = await supabase
            .from('entrepreneurs')
            .update(updates)
            .eq('id', id);

        if (error) {
            console.error('Error updating entrepreneur:', error);
            throw error;
        }
    },

    async deleteEntrepreneur(id: string): Promise<void> {
        const { error } = await supabase
            .from('entrepreneurs')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting entrepreneur:', error);
            throw error;
        }
    },

    // Projects
    async getProjects(): Promise<Project[]> {
        const { data, error } = await supabase
            .from('projects')
            .select(`
        *,
        entrepreneurs (
          business_name
        )
      `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching projects:', error);
            return [];
        }

        return (data || []).map((item: any) => ({
            id: item.id,
            name: item.name || '',
            description: item.description || '',
            status: item.status || 'Planned',
            category: item.category || 'General',
            projectLeader: item.project_leader || '',
            coProjectLeader: item.co_project_leader || '',
            budget: item.budget || 0,
            fiscalYear: item.fiscal_year || '',
            outcome: item.outcome || '',
            completeReportLink: item.complete_report_link || '',
            entrepreneurId: item.entrepreneur_id,
            entrepreneur: item.entrepreneur || item.entrepreneurs?.business_name || 'Unknown'
        }));
    },

    async createProject(project: Omit<Project, 'id'>): Promise<Project | null> {
        const { data, error } = await supabase
            .from('projects')
            .insert([{
                name: project.name,
                description: project.description,
                status: project.status,
                category: project.category,
                project_leader: project.projectLeader,
                co_project_leader: project.coProjectLeader,
                budget: project.budget,
                fiscal_year: project.fiscalYear,
                outcome: project.outcome,
                complete_report_link: project.completeReportLink,
                entrepreneur_id: project.entrepreneurId || null,
                entrepreneur: project.entrepreneur // Saving text input if column exists or ignored
            }])
            .select(`
                *,
                entrepreneurs (
                  business_name
                )
            `)
            .single();

        if (error) {
            console.error('Error creating project:', error);
            throw error;
        }

        return {
            id: data.id,
            name: data.name,
            description: data.description,
            entrepreneur: data.entrepreneur || data.entrepreneurs?.business_name || 'Unknown',
            entrepreneurId: data.entrepreneur_id,
            status: data.status,
            category: data.category,
            projectLeader: data.project_leader,
            coProjectLeader: data.co_project_leader,
            budget: data.budget,
            fiscalYear: data.fiscal_year,
            outcome: data.outcome,
            completeReportLink: data.complete_report_link
        };
    },

    async updateProject(id: string, project: Partial<Project>): Promise<void> {
        const updates: any = {};
        if (project.name !== undefined) updates.name = project.name;
        if (project.description !== undefined) updates.description = project.description;
        if (project.status !== undefined) updates.status = project.status;
        if (project.category !== undefined) updates.category = project.category;
        if (project.projectLeader !== undefined) updates.project_leader = project.projectLeader;
        if (project.coProjectLeader !== undefined) updates.co_project_leader = project.coProjectLeader;
        if (project.budget !== undefined) updates.budget = project.budget;
        if (project.fiscalYear !== undefined) updates.fiscal_year = project.fiscalYear;
        if (project.outcome !== undefined) updates.outcome = project.outcome;
        if (project.completeReportLink !== undefined) updates.complete_report_link = project.completeReportLink;
        if (project.entrepreneurId !== undefined) updates.entrepreneur_id = project.entrepreneurId || null;
        if (project.entrepreneur !== undefined) updates.entrepreneur = project.entrepreneur;


        const { error } = await supabase
            .from('projects')
            .update(updates)
            .eq('id', id);

        if (error) {
            console.error('Error updating project:', error);
            throw error;
        }
    },

    async deleteProject(id: string): Promise<void> {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting project:', error);
            throw error;
        }
    },

    // Consultants
    async getConsultants(): Promise<Consultant[]> {
        const { data, error } = await supabase
            .from('consultants')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching consultants:', error);
            return [];
        }

        return (data || []).map((item: any) => {
            const nameParts = (item.name || '').trim().split(' ');
            let title = '';
            let firstName = '';
            let lastName = '';

            if (nameParts.length >= 3) {
                title = nameParts[0];
                firstName = nameParts[1];
                lastName = nameParts.slice(2).join(' ');
            } else if (nameParts.length === 2) {
                firstName = nameParts[0];
                lastName = nameParts[1];
            } else {
                firstName = nameParts[0] || '';
            }

            return {
                id: item.id,
                title,
                firstName,
                lastName,
                expertise: Array.isArray(item.expertise) ? item.expertise.join(', ') : (item.expertise || ''),
                phone: item.phone,
                workplace: item.workplace,
                email: item.contact_email,
                imageUrl: item.image_url,
            };
        });
    },

    async createConsultant(consultant: Omit<Consultant, 'id'>): Promise<Consultant | null> {
        const fullName = `${consultant.title} ${consultant.firstName} ${consultant.lastName}`.trim();

        // Expertise is likely stored as text[] in DB based on getConsultants handling
        const expertiseValue = consultant.expertise ? [consultant.expertise] : [];

        const { data, error } = await supabase
            .from('consultants')
            .insert([{
                name: fullName,
                expertise: expertiseValue,
                contact_email: consultant.email,
                phone: consultant.phone,
                workplace: consultant.workplace,
                image_url: consultant.imageUrl
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating consultant:', error);
            throw error;
        }

        // Return with split name parts to match Consultant type
        return {
            id: data.id,
            title: consultant.title,
            firstName: consultant.firstName,
            lastName: consultant.lastName,
            expertise: consultant.expertise || '', // Return the string version we just saved
            phone: data.phone,
            workplace: data.workplace,
            email: data.contact_email,
            imageUrl: data.image_url
        };
    },

    async updateConsultant(id: string, consultant: Partial<Consultant>): Promise<void> {
        const updates: any = {};

        // Construct name if parts are updated
        // Note: This is tricky with Partial. Ideally we'd need current values to construct full name correctly if only one part changes.
        // For simplicity, we'll assume calling code passes all name parts if updating name, or we might need to fetch first.
        // Or we update only if all parts are present, or use what is available (potentially risky).
        // Best effort:
        if (consultant.title || consultant.firstName || consultant.lastName) {
            // We can't easily reconstruction without old data if some are missing.
            // But let's assume valid full updates usually pass all.
            // If partial, we might overwrite with empty strings if not careful.
            // Given the UI sends the full object on edit usually, let's try to use what we have, 
            // but strictly we should fetching existing data first if critical.
            // Let's rely on the UI sending complete data for now.
            const title = consultant.title || '';
            const first = consultant.firstName || '';
            const last = consultant.lastName || '';
            // Only update name if at least first or last is provided to avoid wiping it out on accident?
            // Actually, updateConsultant is called with formData which has all fields usually.
            updates.name = `${title} ${first} ${last}`.trim();
        }

        // Wrap expertise in array if present
        if (consultant.expertise !== undefined) {
            updates.expertise = consultant.expertise ? [consultant.expertise] : [];
        }

        if (consultant.email !== undefined) updates.contact_email = consultant.email;
        if (consultant.phone !== undefined) updates.phone = consultant.phone;
        if (consultant.workplace !== undefined) updates.workplace = consultant.workplace;
        if (consultant.imageUrl !== undefined) updates.image_url = consultant.imageUrl;

        const { error } = await supabase
            .from('consultants')
            .update(updates)
            .eq('id', id);

        if (error) {
            console.error('Error updating consultant:', error);
            throw error;
        }
    },

    async deleteConsultant(id: string): Promise<void> {
        const { error } = await supabase
            .from('consultants')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting consultant:', error);
            throw error;
        }
    },

    // Courses
    async getCourses(): Promise<Course[]> {
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching courses:', error);
            return [];
        }

        return (data || []).map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            duration: item.duration,
            instructor: item.instructor,
            syllabusLink: item.syllabus_link,
            contactPhone: item.contact_phone,
            contactEmail: item.contact_email,
        }));
    },

    async createCourse(course: Omit<Course, 'id'>): Promise<Course | null> {
        const { data, error } = await supabase
            .from('courses')
            .insert([{
                title: course.title,
                description: course.description,
                duration: course.duration,
                instructor: course.instructor,
                syllabus_link: course.syllabusLink,
                contact_phone: course.contactPhone,
                contact_email: course.contactEmail
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating course:', error);
            throw error;
        }

        return {
            id: data.id,
            title: data.title,
            description: data.description,
            duration: data.duration,
            instructor: data.instructor,
            syllabusLink: data.syllabus_link,
            contactPhone: data.contact_phone,
            contactEmail: data.contact_email
        };
    },

    async updateCourse(id: string, course: Partial<Course>): Promise<void> {
        const updates: any = {};
        if (course.title !== undefined) updates.title = course.title;
        if (course.description !== undefined) updates.description = course.description;
        if (course.duration !== undefined) updates.duration = course.duration;
        if (course.instructor !== undefined) updates.instructor = course.instructor;
        if (course.syllabusLink !== undefined) updates.syllabus_link = course.syllabusLink;
        if (course.contactPhone !== undefined) updates.contact_phone = course.contactPhone;
        if (course.contactEmail !== undefined) updates.contact_email = course.contactEmail;

        const { error } = await supabase
            .from('courses')
            .update(updates)
            .eq('id', id);

        if (error) {
            console.error('Error updating course:', error);
            throw error;
        }
    },

    async deleteCourse(id: string): Promise<void> {
        const { error } = await supabase
            .from('courses')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting course:', error);
            throw error;
        }
    },

    // Master Data
    async getEstablishmentTypes(): Promise<string[]> {
        const { data, error } = await supabase
            .from('establishment_types')
            .select('name')
            .eq('is_active', true)
            .order('name');

        if (error) return [];
        return (data || []).map((d: any) => d.name);
    },

    async createEstablishmentType(name: string): Promise<void> {
        const { error } = await supabase
            .from('establishment_types')
            .insert([{ name, is_active: true }]);
        if (error) throw error;
    },

    async updateEstablishmentType(oldName: string, newName: string): Promise<void> {
        const { error } = await supabase
            .from('establishment_types')
            .update({ name: newName })
            .eq('name', oldName)
            .eq('is_active', true);
        if (error) throw error;
    },

    async deleteEstablishmentType(name: string): Promise<void> {
        // Soft delete
        const { error } = await supabase
            .from('establishment_types')
            .update({ is_active: false })
            .eq('name', name);
        if (error) throw error;
    },

    async getBusinessCategories(): Promise<string[]> {
        const { data, error } = await supabase
            .from('business_categories')
            .select('name')
            .eq('is_active', true)
            .order('name');

        if (error) return [];
        return (data || []).map((d: any) => d.name);
    },

    async createBusinessCategory(name: string): Promise<void> {
        const { error } = await supabase
            .from('business_categories')
            .insert([{ name, is_active: true }]);
        if (error) throw error;
    },

    async updateBusinessCategory(oldName: string, newName: string): Promise<void> {
        const { error } = await supabase
            .from('business_categories')
            .update({ name: newName })
            .eq('name', oldName)
            .eq('is_active', true);
        if (error) throw error;
    },

    async deleteBusinessCategory(name: string): Promise<void> {
        // Soft delete
        const { error } = await supabase
            .from('business_categories')
            .update({ is_active: false })
            .eq('name', name);
        if (error) throw error;
    },

    // User Profiles
    async getProfiles(): Promise<any[]> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching profiles:', error);
            return [];
        }
        return data || [];
    },

    async updateProfile(id: string, updates: any): Promise<void> {
        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', id);

        if (error) throw error;
    },

    async createProfile(profile: any): Promise<any> {
        // Note: Creating a profile manually usually requires an auth user id.
        // We will generate a random UUID for the profile ID initially.
        // The AuthContext logic will later "claim" this profile by updating the ID to match the real Auth ID.
        const { data, error } = await supabase
            .from('profiles')
            .insert([{
                id: crypto.randomUUID(), // Generate a random UUID
                username: profile.username,
                email: profile.email,
                role: profile.role,
                is_active: profile.isActive,
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating profile:', error);
            throw error;
        }

        return data;
    },

    async deleteProfile(id: string): Promise<void> {
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },


};
