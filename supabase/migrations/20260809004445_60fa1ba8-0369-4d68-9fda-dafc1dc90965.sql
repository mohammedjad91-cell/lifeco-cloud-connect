-- Create the migration for PSA Unit addition with asset_code
BEGIN;

-- 1. Identify IDs
DO $$
DECLARE
    v_plant_id UUID;
    v_area_id UUID;
    v_new_asset_id UUID;
BEGIN
    SELECT id INTO v_plant_id FROM public.plants WHERE name = 'N2-1' LIMIT 1;
    SELECT id INTO v_area_id FROM public.areas WHERE name = 'NITROGEN GENERATION' LIMIT 1;

    -- 2. Insert into equipment_assets
    INSERT INTO public.equipment_assets (
        plant_code,
        tag,
        asset_code,
        asset_name,
        department,
        status,
        criticality,
        location
    ) VALUES (
        'N2-1',
        'Nitrogen PSA Unit',
        'PSA-NITROGEN-GEN', -- Unique asset_code
        'PSA Nitrogen Generator',
        'Ammonia',
        'Pending Verification',
        'High',
        'NITROGEN GENERATION'
    ) RETURNING id INTO v_new_asset_id;

    -- 3. Insert Identity Card & Operating Card data
    INSERT INTO public.equipment_identity_cards (
        asset_id,
        equipment_tag,
        equipment_name,
        equipment_type,
        service,
        manufacturer,
        model,
        capacity,
        upstream,
        downstream,
        description,
        safety_notes,
        protection_matrix,
        operating_control,
        detailed_running_data
    ) VALUES (
        v_new_asset_id,
        'Nitrogen PSA Unit',
        'PSA Nitrogen Generator',
        'PSA Nitrogen Generator',
        'Nitrogen Generation',
        'Pending Verification',
        'Pending Verification',
        'Pending Verification',
        '60-2003 → 04-04 → PSA',
        'Pending Verification',
        'إنتاج النيتروجين من الهواء المضغوط القادم من منظومة 60-2003 عبر خط 04-04. (Status: Pending Tag Verification)',
        'كل البيانات غير الموثقة = Pending Verification. لا تستخدم PSA-1 القديم.',
        jsonb_build_object(
            'alarms', 'Pending Verification',
            'trips', 'Pending Verification',
            'interlocks', 'Pending Verification'
        ),
        jsonb_build_object(
            'start_up', 'Pending Verification',
            'normal_operation', 'Pending Verification',
            'psa_cycle', jsonb_build_object(
                'adsorption', 'Pending Verification',
                'regeneration', 'Pending Verification',
                'switching', 'Pending Verification'
            ),
            'shutdown', 'Pending Verification',
            'emergency_shutdown', 'Pending Verification'
        ),
        jsonb_build_object(
            'feed_air', 'Pending Verification',
            'product_nitrogen', 'Pending Verification',
            'operating_pressure', 'Pending Verification',
            'nitrogen_purity', 'Pending Verification',
            'flow', 'Pending Verification',
            'dew_point', 'Pending Verification'
        )
    );
END $$;

COMMIT;