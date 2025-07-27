-- Grant access to testimonials table for authenticated users
CREATE POLICY "Authenticated users can read their own testimonials"
ON "public"."testimonials"
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Grant access to testimonials table for anonymous users to view approved testimonials
CREATE POLICY "Anyone can view approved testimonials"
ON "public"."testimonials"
FOR SELECT
TO anon
USING (status = 'approved');

-- Grant access to testimonials table for authenticated users to insert their own testimonials
CREATE POLICY "Authenticated users can insert their own testimonials"
ON "public"."testimonials"
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Grant access to testimonials table for authenticated users to update their own testimonials
CREATE POLICY "Authenticated users can update their own testimonials"
ON "public"."testimonials"
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Grant access to testimonials table for authenticated users to delete their own testimonials
CREATE POLICY "Authenticated users can delete their own testimonials"
ON "public"."testimonials"
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Grant full access to testimonials table for service_role
CREATE POLICY "Service role has full access to testimonials"
ON "public"."testimonials"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
